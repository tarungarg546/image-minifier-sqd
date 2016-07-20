module.exports = {
  port: 8000,
  hostname: 'localhost',
  protocol: 'http',
  views: '/views',
  static: '/static',
  renderEngine: 'ejs',
  buildPath: '/build/',
  buildDist: 'dist',// it is relative to buildpath
  buildSrc: 'src', // we'll need to manually create them in server too
  buildDoc: 'tmp'
}