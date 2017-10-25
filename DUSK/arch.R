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
