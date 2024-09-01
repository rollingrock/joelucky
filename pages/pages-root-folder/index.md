---
#
# Use the widgets beneath and the content will be
# inserted automagically in the webpage. To make
# this work, you have to use › layout: frontpage
#
layout: frontpage
header:
  image_fullwidth: jl/page-title-bg.jpg
widget1:
  title: "Who are we?"
  url: '/info/'
  image: jl/2015_Color_Banner_Logo - 302.jpg
  text: 'Our mission is to impact the lives of young students in our community through the proceeds generated from the annual Joe Lucky Memorial Golf Tournament in providing financial aid to students.'
widget2:
  title: "Urgent Cause"
  url: '/info/'
  text: '<em>Supporting Children of Young Widows</em> - To provide educational support for the children of young widows who have lost their spouse due to a sudden tragedy.'
  image: jl/2010-JLMGT-Sherrill-Park-Golf-Course-122.jpg
widget3:
  title: "Golf Tournament"
  url: '/info/'
  image: jl/golf-stock.png
  text: '<em>Tournament Registration</em> - Learn more about the annual golf tournament and how to register here.   Complete the attached pdf and return to us by email'
#
# Use the call for action to show a button on the frontpage
#
# To make internal links, just use a permalink like this
# url: /getting-started/
#
# To style the button in different colors, use no value
# to use the main color or success, alert or secondary.
# To change colors see sass/_01_settings_colors.scss
#
callforaction:
  url: /info/
  text: Become a Volunteer! ›
  style: alert
permalink: /index.html
#
# This is a nasty hack to make the navigation highlight
# this page as active in the topbar navigation
#
homepage: true
---
