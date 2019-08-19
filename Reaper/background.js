// Based on Process Monitor for Chrome by Andy Young
// https://github.com/andyyoung/Process-Monitor-for-Chrome
// See LICENSE file.
// 2018-10-31

var cpu_history = {'overall': []};
var icon_draw_context;
var done_init = false;

// Processes don't have URLs; tabs do.  The tabId persists while the pid and
// URL change.  The URL is available only through asynchronous callbacks.
// Values are arrays of size 2: [url, hostname].
var pid2url = {};

// Need up to 30 samples for thresholding.  Icon uses only 19.
const MAXKEEP = 32;

// There's a race between the asynchronous settings load in init and the
// start of work in receiveProcessInfo.  sthresh is initialized to a value
// larger than MAXKEEP to prevent rules from firing before the settings load
// completes.
var sthresh = 100;
var cthresh = 100;
var wlist = [];

function init() {
  if (done_init) { return; }
  done_init = true;
  icon_draw_context = document.getElementById('canvas').getContext('2d');
  icon_draw_context.fillStyle = '#f6f6f6';
  icon_draw_context.fillRect(0, 0, 19, 19);
  chrome.browserAction.setIcon({imageData: icon_draw_context.getImageData(0, 0, 19, 19)});
  chrome.storage.local.get({   // runs asynchronously
      settingsthresh: 5,
      settingcthresh: 90,
      settingwlist:   ''
    }, function(items) {
      sthresh = items.settingsthresh;
      cthresh = items.settingcthresh;
      wlist   = items.settingwlist.split('\n');
      console.info('Reaper starting with sthresh ' + sthresh + ' cthresh ' + cthresh + ' wlist ' + wlist);
  });
  chrome.storage.onChanged.addListener(settingsChange);
  chrome.processes.onUpdated.addListener(receiveProcessInfo);
  // ^ If memory stats are needed, upgrade to onUpdatedWithMemory.
}

function settingsChange(changes, areaName) {
  if (areaName == 'local') {
    if (changes.hasOwnProperty('settingsthresh')) {
      sthresh = changes['settingsthresh'].newValue;
      console.info('Settings change: new sthresh ' + sthresh);
    }
    if (changes.hasOwnProperty('settingcthresh')) {
      cthresh = changes['settingcthresh'].newValue;
      console.info('Settings change: new cthresh ' + cthresh);
    }
    if (changes.hasOwnProperty('settingwlist')) {
      wlist = changes['settingwlist'].newValue.split('\n');
      console.info('Settings change: new wlist ' + wlist);
    }
  }
}

function describeProcess(process) {
  let descript = process.tasks[0].title,
      url = pid2url[process.id];
  if (typeof url !== 'undefined')
    descript += ' (' + url[0] + ')';
  return descript;
}

function tabCallbackCurry(pid) {
  return function(tab) {
    // We get "No tab with id: x" when profile boundaries are crossed.
    if (!chrome.runtime.lastError)
      if (typeof tab !== 'undefined')
        pid2url[pid] = [tab.url, (new URL(tab.url)).hostname];
  };
}

function receiveProcessInfo(processes) {
  let totalCPU = 0,
      reapList = [];

  for (const pid in processes) { // pid is a stringified integer.
    totalCPU += processes[pid].cpu;
    if (!cpu_history[pid]) {
      // New process
      cpu_history[pid] = [];
      let tabId = processes[pid].tasks[0].tabId;
      if (typeof tabId !== 'undefined')
        chrome.tabs.get(tabId, tabCallbackCurry(pid));
    }
    cpu_history[pid].unshift(processes[pid].cpu);
    while (cpu_history[pid].length > MAXKEEP)
      cpu_history[pid].pop();

    // Not allowed to kill pid 0 (the browser).
    if (pid != 0 && cpu_history[pid].length >= sthresh) {
      reaper: {
        for (i=0; i<sthresh; ++i)
          if (cpu_history[pid][i] < cthresh)
            break reaper;

        // Whitelist.
        let p = processes[pid],
	    title = p.tasks[0].title,
	    url = pid2url[pid],
            hostname = null;
        if (typeof url !== 'undefined')
          hostname = url[1];
        for (const w of wlist)
          if (title == w || hostname != null && hostname == w)
            break reaper;

        console.info(describeProcess(p) + ': time to die');
        reapList.push(processes[pid].id); // number not string
      }
    }
  }

  // Terminate processes.
  for (const pid of reapList) {
    let desc = describeProcess(processes[pid]);
    chrome.processes.terminate(pid, function(result){
      // Ignore result (often false when termination was successful).
      console.info(desc + ': dead');
      chrome.notifications.create('', {
	type: 'basic',
	iconUrl: 'icon128.png',
	title: 'Reaper',
	message: desc + ': terminated'
      });
    });
  }

  // Purge stale data.
  for (const pid in cpu_history)
    if (pid != 'overall' && !processes[pid]) {
      delete cpu_history[pid];
      // There's no penalty for deleting a property that doesn't exist.
      delete pid2url[pid];
    }

  // Graph total utilization.
  cpu_history['overall'].unshift(totalCPU);
  while (cpu_history['overall'].length > MAXKEEP)
    cpu_history['overall'].pop();
  draw_cpu_graph(cpu_history['overall'], icon_draw_context, 19, 19, 8, 1, 0);
  chrome.browserAction.setIcon({ imageData: icon_draw_context.getImageData(0, 0, 19, 19) });
  padding = totalCPU < 10 ? ' ' : '';
  chrome.browserAction.setBadgeText({text: padding + Math.floor(totalCPU).toString() + '%' + padding});
  chrome.browserAction.setBadgeBackgroundColor({color:get_color_for_cpu(totalCPU)});
}

function draw_cpu_graph(data, context, width, height, height_offset, col_width, gap_width) {
  context.fillStyle = '#f6f6f6';
  context.fillRect(0, 0, width, height);
  for (var i = 0; i < data.length; i++) {
    var x = width - (i * (col_width + gap_width));
    if (x < 0) break;
    context.strokeStyle = get_color_for_cpu(data[i]);
    context.beginPath();
    context.moveTo(x, height);
    context.lineTo(x, height - height_offset - (Math.min(data[i], 100)*(height - height_offset)/100));
    context.stroke();
  }
}

function get_color_for_cpu(cpu) {
  return cpu > 30 ? '#F00' : '#228B22';
}

document.addEventListener('DOMContentLoaded', init);
