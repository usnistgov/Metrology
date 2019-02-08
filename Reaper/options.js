// Based on example code
// https://developer.chrome.com/extensions/options
// CC-By 3.0 license
// 2018-10-31

// Saves options to chrome.storage
function save_options() {
  var sthresh = document.getElementById('sthresh').value;
  var cthresh = document.getElementById('cthresh').value;
  var wlist   = document.getElementById('wlist').value;
  chrome.storage.local.set({
      settingsthresh: sthresh,
      settingcthresh: cthresh,
      settingwlist:   wlist
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
	status.textContent = '';
      }, 750);
  });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
      settingsthresh: 5,
      settingcthresh: 90,
      settingwlist:   ''
    }, function(items) {
      document.getElementById('sthresh').value = items.settingsthresh;
      document.getElementById('cthresh').value = items.settingcthresh;
      document.getElementById('wlist').value   = items.settingwlist;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
