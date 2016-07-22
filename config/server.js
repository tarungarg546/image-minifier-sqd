module.exports = {
  port: 8000,
  hostname: 'localhost',
  protocol: 'http', 
  views: '/views', //from where templates will be served
  static: '/static', // from where static resources will be served
  renderEngine: 'ejs', //render engine used by our app
  buildPath: '/build/', //where the builds will be saved
  buildDist: 'dist/',// Where build distributable images are stored
  buildSrc: 'src/',  // where Source of those those builds reside
  buildDoc: 'doc/' //where documentation for those builds reside
}