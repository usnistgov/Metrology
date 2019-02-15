# Dimensionless units software kit

David Flater, david.flater@nist.gov\
Last modified: Tue Oct 24 08:58:17 EDT 2017

## Introduction

This document describes an experimental software kit available for testing by
researchers and scientists.&nbsp; It works with
[R](https://www.r-project.org/) through the
[units](https://cran.r-project.org/web/packages/units/index.html) package and
with anything else that builds on the
[UDUNITS2](https://www.unidata.ucar.edu/software/udunits/) library
([disclaimer](#disclaimer)).

The purpose of this kit is to experiment with new approaches to units for
counted quantities and ratios of two quantities of the same kind.&nbsp; These
new approaches diverge from standard practice and do not represent official
positions of the National Institute of Standards and Technology (NIST).&nbsp;
Motivational background and explanation can be found in the following
papers:&nbsp; (1) Peter J. Mohr and William D. Phillips, [Dimensionless units
in the SI](https://doi.org/10.1088/0026-1394/52/1/40), (2) David Flater,
[Architecture for Software-Assisted Quantity
Calculus](https://doi.org/10.6028/NIST.TN.1943) (Section 6), and (3)
[Redressing grievances with the treatment of dimensionless quantities in
SI](https://doi.org/10.1016/j.measurement.2017.05.043).

Being experimental, the software kit is not a complete implementation of
the architecture described and is not expected to be free of problems.

[Installation instructions](#installation-of-software-kit) currently are
provided only for Linux and OS X.&nbsp; Instructions tailored for Windows
installations will be added when needed.


## License

(The following text is from https://www.nist.gov/director/licensing as it
reads on 2017-10-10.)

This software was developed by employees of the National Institute of Standards and Technology (NIST), an agency of the Federal Government.&nbsp; Pursuant to title 17 United States Code Section 105, works of NIST employees are not subject to copyright protection in the United States and are considered to be in the public domain.&nbsp; Permission to freely use, copy, modify, and distribute this software and its documentation without fee is hereby granted, provided that this notice and disclaimer of warranty appears in all copies.

THE SOFTWARE IS PROVIDED 'AS IS' WITHOUT ANY WARRANTY OF ANY KIND, EITHER EXPRESSED, IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, ANY WARRANTY THAT THE SOFTWARE WILL CONFORM TO SPECIFICATIONS, ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND FREEDOM FROM INFRINGEMENT, AND ANY WARRANTY THAT THE DOCUMENTATION WILL CONFORM TO THE SOFTWARE, OR ANY WARRANTY THAT THE SOFTWARE WILL BE ERROR FREE.&nbsp; IN NO EVENT SHALL NIST BE LIABLE FOR ANY DAMAGES, INCLUDING, BUT NOT LIMITED TO, DIRECT, INDIRECT, SPECIAL OR CONSEQUENTIAL DAMAGES, ARISING OUT OF, RESULTING FROM, OR IN ANY WAY CONNECTED WITH THIS SOFTWARE, WHETHER OR NOT BASED UPON WARRANTY, CONTRACT, TORT, OR OTHERWISE, WHETHER OR NOT INJURY WAS SUSTAINED BY PERSONS OR PROPERTY OR OTHERWISE, AND WHETHER OR NOT LOSS WAS SUSTAINED FROM, OR AROSE OUT OF THE RESULTS OF, OR USE OF, THE SOFTWARE OR SERVICES PROVIDED HEREUNDER.


## Disclaimer

Specific computer hardware and software products are identified in this
document to support reproducibility of results.&nbsp; Such identification
does not imply recommendation or endorsement by the National Institute of
Standards and Technology, nor does it imply that the products identified are
necessarily the best available for the purpose.


## Kit contents

Provided files:

```
19518 Oct 10 13:45 udunits-2.2.25-dwf-patch.txt
  560 Oct 10 15:14 units_0.4-6-dwf-patch.txt         [OPTIONAL]
 3667 Oct 11 09:47 arch.R                            [OPTIONAL]
```

Other needed files are available from public web sites:

```
 1006463 Oct 10 12:58 udunits-2.2.25.tar.gz          [Unidata]
   67182 Dec  2  2016 udunits2_0.13.tar.gz           [CRAN]
  783289 Oct 10 13:07 units_0.4-6.tar.gz             [CRAN]
10839577 Oct 10 13:08 BH_1.65.0-1.tar.gz             [CRAN, OPTIONAL]
 3751669 Oct 10 13:09 Rcpp_0.12.13.tar.gz            [CRAN, OPTIONAL]
  244643 Oct 10 13:11 xml2_1.1.1.tar.gz              [CRAN, OPTIONAL]
```


## Background on UDUNITS2

UDUNITS2 is a free "quantities and units" package from Unidata, a community
program of the University Corporation for Atmospheric Research (UCAR).&nbsp;
As described on its [web
site](https://www.unidata.ucar.edu/software/udunits/), "The UDUNITS package
supports units of physical quantities.&nbsp; Its C library provides for
arithmetic manipulation of units and for conversion of numeric values between
compatible units.&nbsp; The package contains an extensive unit database,
which is in XML format and user-extendible.&nbsp; The package also contains a
command-line utility for investigating units and converting values."

Users of the [R package](https://www.r-project.org/) for statistical
computing can gain this functionality within the R environment through a
combination of two packages,
[udunits2](https://cran.r-project.org/web/packages/udunits2/index.html) and
[units](https://cran.r-project.org/web/packages/units/index.html).&nbsp; The
first package provides low-level integration with the external UDUNITS2
library while the second provides high-level arithmetic and other functions
for quantities and units.

There are, of course, many other "quantities and units" packages for both
C language and R.&nbsp; This particular configuration was the basis for the
experimental patch described in the next section.


## Modifications to UDUNITS2

The modifications are distributed as a patch in a best effort at
separating new content, which by U.S. law is in the public domain, from the
original UDUNITS2, which is copyrighted by UCAR and contributors.

The changes to the C library are:

- Dimensionless units are no longer treated as all being equivalent to one
  another and to the number 1.
- Attempting to format a unit that has no symbol no longer fails; instead,
  the full name is returned.

The changes to the units database are:

-   The following have been defined or redefined as dimensionless counting
    units:&nbsp; count (cnt), event (evt), entity (ent), molecule (mcl),
    atom, particle (pcl), detection, decay (dcy), bit, pixel (px), fault,
    failure (fail), line_of_code (LOC), clocktick.&nbsp; (Note that the
    symbol atm resolves to atmosphere, not atom.)
-   The mole base unit has been converted into a numerical constant which
    can be multiplied by a counting unit (e.g., mol.mcl).
-   Consistent with Mohr &amp; Phillips, hertz (Hz) has been redefined as
    cycle/s = 2&pi; rad/s and becquerel (Bq) has been redefined as
    decay/s.&nbsp; Conflicting interpretations of hertz within information
    technology must instead reference bit/s (bps) or clocktick/s, as
    applicable.
-   Mass_fraction has been defined as kg/kg, which still automatically
    reduces to 1.&nbsp; ([Question on handling of ratio units](#handling-of-ratio-units))
-   Binary prefixes have been added.
-   Byte (octet, B) = 8 bits (was numerical constant 8).
-   bps = bit/s (was hertz).
-   The following definitions have been deleted:
    -   avogadro_constant (was 6.02214179e23/mol).
    -   einstein (was supposed to be an amount of energy, but was
	defined as a synonym for mole).
    -   molec, nucleon, and nuc (were 1/avogadro_constant).
    -   baud (BD, was a synonym for hertz).

Automatic generalization of counting units to their supertypes is not
implemented.


## Effects on convertibility

The following results came from the command line program udunits2 that is
installed along with the UDUNITS2 C library.

Command | Stock UDUNITS2 | Modified
--- | --- | ---
`udunits2 -A -H byte -W rad` | 1 byte = 8 rad | not convertible
`udunits2 -A -H kg/kg -W rad` | 1 kg/kg = 1 rad | not convertible
`udunits2 -A -H rad/s -W Hz` | 1 rad/s = 1 Hz | 1 rad/s = 0.159155 Hz
`udunits2 -A -H cycle/s -W Hz` | 1 cycle/s = 6.28319 Hz | 1 cycle/s = 1 Hz
`udunits2 -A -H bit/s -W Hz` | 1 bit/s = 1 Hz | not convertible
`udunits2 -A -H bit.Hz -W bit/s` | 1 bit.Hz = 1 bit/s | not convertible
`udunits2 -A -H sr -W rad` | 1 sr = 1 rad | not convertible
`udunits2 -A -H rad -W rad^3` | 1 rad = 1 rad^3 | not convertible
`udunits2 -A -H bit/m.bit/m -W ""` | m-2 | m-2.bit2 \*
`udunits2 -A -H bit -W pi` | 1 bit = 0.31831 pi | not convertible
`udunits2 -A -H mol.molecule -W ""` | 1.66053878316273e-24 mol2 | 6.022140857e+23 mcl

\* [Question on exponentiation of counting units](#exponentiation-of-counting-units)


## Using units in R

Units recognized by UDUNITS2 are looked up using the parse_unit function
and then multiplied by a magnitude to obtain a quantity.&nbsp; Subsequent
mathematical operations on quantities proceed according to the rules of
quantity calculus.&nbsp; Parsing a unit in product power form, such as "kg
m-2 s-1", is equivalent to parsing the individual units and then doing the
algebra.

Units are sometimes, but not always, simplified automatically.&nbsp; When
necessary, a conversion or simplification can be requested by attempting to
assign units through the units() accessor as exemplified below.

```
> library(units)
> cm <- parse_unit("cm")
> m2 <- parse_unit("m2")
> L <- parse_unit("liter")
> rainfall <- 4.7*cm
> garden_area <- 20*m2
> amount_water <- rainfall * garden_area
> amount_water
94 cm*m^2
> units(amount_water) <- L
> amount_water
940 liter
> units(amount_water) <- cm
Error: cannot convert liter into cm
```

If an unrecognized name or symbol is passed to make_unit, it will be created
as a new, irreducible unit.&nbsp; *Ad hoc* counting units can be introduced
this way.

```
> library(units)
> swan <- make_unit("swan")
> duck <- make_unit("duck")
> uno <- parse_unit("1")
> mfrac <- parse_unit("mass_fraction")
> swan
1 swan
> units(swan) <- duck
Error: cannot convert swan into duck
> units(swan) <- uno
Error: cannot convert swan into 1
> mfrac
1 mass_fraction
> units(mfrac) <- duck
Error: cannot convert mass_fraction into duck
> units(mfrac) <- uno
> mfrac
1 1
```

Units can be coerced to other types, when necessary, through explicit
conversions:

```
> q1 <- 4 * swan
> q2 <- 3 * duck
> q3 <- q1 + q2
Error: cannot convert duck into swan
> bird <- make_unit("bird")
> install_conversion_function("duck", "bird", function(x) x)
> install_conversion_function("swan", "bird", function(x) x)
> units(q1) <- bird
> q3 <- q1 + q2
> q3
7 bird
```

The instructions for the R units package reference an environment,
ud_units, that contains predefined symbols for all units, avoiding the need
to call parse_unit all the time.&nbsp; Unfortunately, this environment is
loaded from a static, pre-built binary file that was compiled from the
default UDUNITS2 database.&nbsp; A procedure for refreshing ud_units is given
in [Appendix A](#appendix-a-refreshing-ud_units).

The file arch.R contains demonstration code that builds on the units library
to implement values, distributions, and propagation of uncertainty as
described in [Architecture for Software-Assisted Quantity
Calculus](https://doi.org/10.6028/NIST.TN.1943).&nbsp; The commented source
is provided in [Appendix B](#appendix-b-contents-of-archr).


## Questions to be answered

### Exponentiation of counting units

Presently, multiplication of counted quantities is done the same way as
other quantities, potentially resulting in counting units with
exponents.&nbsp; For example, what resolution is my computer monitor?

```
You have: (1280 pixels).(1024 pixels)
You want: 
    1310720 px2
```

Although pixels on modern monitors are square, there is no such thing as a
square pixel in the sense analogous to a square meter.&nbsp; Pixels are
simply counted to measure area, just as they are counted to measure
length.&nbsp; To get the right answer in megapixels, at least one of the
dimensions must be reduced to a number, or else the result must be divided by
pixel to discard the unwanted exponent.

```
You have: 1280.(1024 pixels)
You want: megapixels
    1 1280.(1024 pixels) = 1.31072 megapixels
    x/megapixels = 1.31072*(x/(1280.(1024 pixels)))

You have: 1280*1024 pixels
You want: megapixels
    1 1280*1024 pixels = 1.31072 megapixels
    x/megapixels = 1.31072*(x/(1280*1024 pixels))
```

The library could be modified to simply drop the exponents from counting
units.&nbsp; The question is, are there many examples where this would be the
wrong thing to do?&nbsp; One such example arises when determining units for
Halstead metrics (Maurice H. Halstead, *Elements of Software Science*,
Elsevier, 1977).&nbsp; If we take it as given that program volume (V) and
potential volume (V\*) are measured in bits, then the unit of effort (E =
V<sup>2</sup>/V\*) should also be bits, not "elementary mental
discriminations" as Halstead claims.&nbsp; Dropping exponents from counting
units would create a hazard of getting a different unit depending on the
order of operations.


### Fractional counts

At present, consistent with the original UDUNITS2 behavior, counted
quantities are not constrained to have values that are integers.&nbsp;
It is a question whether imposing such a constraint would be a net
improvement.


### Katal

Katal, the derived unit of catalytic activity, is defined as mol/s.&nbsp;
It is analogous to the SI definitions of Hz and Bq in that there is an
implication of something being counted in the numerator.&nbsp; However,
one can argue over whether the countee is events (reactions) or entities
(as is implied by amount of substance)&mdash;or whether the existence of
the conundrum implies that counting units are a mistake.

If one is determined to do so, one can define a unit that is a subtype of
both entity and event, but this will lead to the confusion of distinct
phenomena.&nbsp; In this case it would be better to understand that we have
two different quantities that, under the circumstances, are known to be
numerically equal when measured in their respective units (entities and
events).


### Handling of ratio units

The radian, despite being derived as a ratio of lengths, normally has a
direct application through angular quantities and functions.&nbsp; Automatic
conversion to a ratio of lengths or a plain number is undesirable.&nbsp; In
contrast, a mass fraction must nearly always be converted to a ratio of
masses or a plain number in order to participate usefully in subsequent
calculations.

NIST's expressed position that the radian should be a base unit (see
Sec. 3.1.8 of [CCU22](https://www.bipm.org/utils/common/pdf/CC/CCU/CCU22.pdf))
suggests that the radian is simply a special case, and that other ratio units
should be treated in the manner that UDUNITS2 originally treated the
radian.&nbsp; However, it seems possible that other ratio units could have
applications similar to the radian.&nbsp; (Examples?)&nbsp; In which case,
there is no automatic right answer for ratios, and a convention to indicate
when conversions should and should not occur is needed.


## Installation of software kit

### Platform:&nbsp; Linux

(It is assumed that GCC and R have already been installed.)

```
bash-4.3$ tar xf udunits-2.2.25.tar.gz
bash-4.3$ cd udunits-2.2.25
bash-4.3$ patch -p1 < ../udunits-2.2.25-dwf-patch.txt
patching file lib/formatter.c
patching file lib/udunits2-accepted.xml
patching file lib/udunits2-base.xml
patching file lib/udunits2-common.xml
patching file lib/udunits2-derived.xml
patching file lib/udunits2-prefixes.xml
patching file lib/unitcore.c
bash-4.3$ ./configure --prefix=/usr/local
bash-4.3$ make -j 8
bash-4.3$ sudo make install
bash-4.3$ sudo ldconfig   # ensure that library cache is updated
```

Note:&nbsp; On Linux distributions that do not use sudo, you must instead
`su` and then `make install`.

```
bash-4.3$ sudo R CMD INSTALL udunits2_0.13.tar.gz units_0.4-6.tar.gz
```


### Platform:&nbsp; OS X

Compiler:&nbsp; The Clang compiler is included in "Xcode Command Line Tools,"
which can be installed without necessarily installing the entirety of the
Xcode development environment.&nbsp; Installation instructions for the
command line tools can be found
[here](https://railsapps.github.io/xcode-command-line-tools.html).

R:&nbsp; An app-ified version of R is distributed as an installable .pkg
file from [CRAN](https://cran.r-project.org/).

Installation can then proceed as under Linux using the command line
in the Terminal app, with the exception that ldconfig does not exist and
is not necessary.


## Appendix A.&nbsp; Refreshing ud_units

The following steps are required to refresh ud_units (in the R package
units) from the database that is currently active for the UDUNITS2
installation.

1. Install additional dependencies:

   ```
   sudo R CMD INSTALL Rcpp_0.12.13.tar.gz BH_1.65.0-1.tar.gz xml2_1.1.1.tar.gz
   ```

2. Patch the units package to regenerate its unit symbol environment instead
   of using the bundled, pre-compiled sysdata.rda data file:

   ```
   tar xf units_0.4-6.tar.gz
   cd units
   rm R/sysdata.rda
   patch -p1 < ../units_0.4-6-dwf-patch.txt
   cd ..
   tar czf units_0.4-6-dwf.tar.gz units
   rm -rf units
   ```

3. Set the environment variable UDUNITS2_XML_PATH to point to the udunits2.xml
   file of the UDUNITS2 installation:

   ```
   export UDUNITS2_XML_PATH=/usr/local/share/udunits/udunits2.xml
   ```

4. Install the patched units package:

   ```
   sudo -E R CMD INSTALL units_0.4-6-dwf.tar.gz
   ```

A fresh ud_units environment is constructed during the installation
process and compiled into the R package.&nbsp; Any subsequent changes to the
XML database will not propagate until the units_0.4-6-dwf.tar.gz installation
is repeated.

Note:&nbsp; The list of XML files to build into the environment is
hard-coded in R/ud_units.R, not read from udunits2.xml.


## Appendix B.&nbsp; Contents of arch.R

```
# 2017-10-11
# R code:
# Unpackaged demo using quantities, units, and values as described in TN 1943.
# There is more than one way to do it.
# To use:  source('arch.R')
# Demo:
# > source('arch.R')
# > qhist(basem)      # Uniform random
# > qhist(baseft)     # Uniform random
# > qhist(dlen)       # Trapezoidal
# > qkern(dlen)       # Same
# > q2D(comp1,n=1e5)  # 2D uniform (m and rad)
# > q2D(comp2,n=1e5)  # Circle (m and m)
# (Nothing is done with const)

library(units)

# A value (as defined in TN 1943) is represented by a list of length 2.
#  $f  Function to return a vector of samples from the distribution.
#      f(x, n=1) where x is a list of input values.
#      Measurement data can use empirical distribution.
#  $x  List of input values to pass to f, or NA if there are none.
# Everything must be vectorized because function calls are slow.

# To represent a compound value, $f must instead return a list of vectors.
# The nth compound sample is composed of the nth element of each of the
# contained vectors.

# ----------------- Generic functions -----------------

# qsamp:  sample a value.
qsamp <- function(q, n=1) q$f(q$x, n)

# qsampl:  sample every element of a list of values and return the results as
# a corresponding list.
qsampl <- function(l, n=1) lapply(l, function(q) q$f(q$x, n))

# qhist:  pop up a histogram of a simple value.
# unclass(samp) is to work around hist.units because it fails with "unary -
# not defined for "units" objects" as of units 0.4.
qhist <- function(q, n=1e6, breaks=30) {
  samp <- q$f(q$x, n)
  hist(x=unclass(samp), breaks=breaks, xlab=units(samp), main='Histogram')
}

# qkern:  pop up a kernel density plot of a simple value.
qkern <- function(q, n=1e6, bw="nrd") {
  samp <- q$f(q$x, n)
  d <- density(samp, bw=bw)
  plot(d,xlab=units(samp),ylab='Density',main='Kernel density plot',col='blue',lwd=3)
}

# q2D:  pop up a 2-dimensional plot of a 2-component compound value.
q2D <- function(q, n=1e6) {
  samp <- q$f(q$x, n)
  plot(x=samp[[1]], y=samp[[2]],
       xlab=units(samp[[1]]), ylab=units(samp[[2]]),
       main='Scatter plot', col='blue', pch=20)
}

# --------- Examples for testing or demo ---------

# Get units
m <- parse_unit("m")
ft <- parse_unit("ft")
px <- parse_unit("px")
rad <- parse_unit("rad")

# A uniform random distribution of length (units meters)
dlength1 <- function(x,n=1) runif(n, min=5, max=10) * m
# Base value
basem <- list(f=dlength1, x=NA)

# A uniform random distribution of length (units feet)
dlength2 <- function(x,n=1) runif(n, min=5, max=10) * ft
# Base value
baseft <- list(f=dlength2, x=NA)

# Derived value that sums its inputs
dsum <- function(x,n=1) Reduce(`+`,qsampl(x,n))
dlen <- list(f=dsum, x=list(basem, baseft))
# Range of resulting trapezoidal distribution:
#   5 m +  5 ft =  6.524 m
#  10 m + 10 ft = 13.048 m

# Base value with a degenerate distribution
const <- list(f=function(x,n=1) rep(640,n)*px, x=NA)
# qhist(const) produces a stupid box; FIXME.
# qkern(const) fails unless bw is specified (and then you get a bell curve).

# Compound base value
dcomp1 <- function(x,n=1) list(runif(n,min=9,max=10)*m,
                               runif(n,min=0,max=2*pi)*rad)
comp1 <- list(f=dcomp1, x=NA)

# Derived compound value with compound input
# (polar coordinates to rectangular coordinates)
dcomp2 <- function(x,n=1) {
  samp   <- qsamp(x[[1]], n)
  radius <- samp[[1]]
  angle  <- samp[[2]]
  # units 0.4 warned: "Operation cos/sin not meaningful for units"
  # 0.4-6 now fails:  "Error: cannot convert rad into 1"
  # Work around.
  angle <- angle/rad
  list(radius * cos(angle), radius * sin(angle))
}
comp2 <- list(f=dcomp2, x=list(comp1))
```


## Appendix C.&nbsp; Other notes

To install R package udunits2 when the C library UDUNITS2 is in an
unexpected location:

```
R CMD INSTALL --configure-args='--with-udunits2-lib=/usr/local/udunits-2x/lib --with-udunits2-include=/usr/local/udunits-2x/include' udunits2_0.13.tar.gz
```

The R package udunits2 installs yet another copy of the unmodified XML,
which it uses if the default configuration fails to load.

To locate installed R packages:

```
> .libPaths()
[1] "/usr/local/R-3.3.1/lib64/R/library"
```
