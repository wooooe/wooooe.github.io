var posts=["2026/04/05/hello-world/","2026/04/05/test/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };