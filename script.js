var mainPlayer;
var videoList = [];
var articleList = [];
var videosPerPage = 15;
var currentVideoPage = 1;

function onYouTubeIframeAPIReady() {
  mainPlayer = new YT.Player('mainPlayer', {
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  var thumbnail = document.getElementById('thumbnail');
  var resumeLink = document.getElementById('resumeLink');

  if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    thumbnail.style.display = 'flex';
    if (event.data === YT.PlayerState.PAUSED) {
      resumeLink.innerHTML = 'Resume Video';
    } else if (event.data === YT.PlayerState.ENDED) {
      resumeLink.innerHTML = 'Replay Video';
    }
  } else {
    thumbnail.style.display = 'none';
  }
}

function playVideo(videoId) {
  mainPlayer.loadVideoById(videoId);
}

function resumeVideo() {
  var thumbnail = document.getElementById('thumbnail');
  thumbnail.style.display = 'none';
  mainPlayer.playVideo();
}

function loadMoreVideos() {
  currentVideoPage++;
  renderVideoList();
}

function addVideo() {
  var url = document.getElementById('videoUrl').value;
  var anchor = document.getElementById('videoAnchor').value;
  var thumbnail = document.getElementById('videoThumbnail').value;

  if (url && anchor && thumbnail) {
    var videoId = extractVideoId(url);
    var videoItem = {
      id: videoId,
      anchor: anchor,
      thumbnail: thumbnail,
    };

    videoList.push(videoItem);
    saveData();
    renderVideoList();
    clearVideoForm();
    showSuccessMessage("Video added successfully");
  }
}

function extractVideoId(url) {
  try {
    var regex = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    var match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error('Invalid YouTube URL');
    }
  } catch (error) {
    alert(error.message);
    return null;
  }
}

function renderVideoList() {
  var videoListContainer = document.getElementById('videoList');
  videoListContainer.innerHTML = '';

  var startIndex = (currentVideoPage - 1) * videosPerPage;
  var endIndex = startIndex + videosPerPage;
  var currentVideoItems = videoList.slice(startIndex, endIndex);

  currentVideoItems.forEach(function(videoItem) {
    var videoElement = document.createElement('div');
    videoElement.className = 'video-item';
    videoElement.innerHTML = `
      <img src="${videoItem.thumbnail}" onclick="playVideo('${videoItem.id}')">
      <span onclick="playVideo('${videoItem.id}')" style="cursor: pointer;">${videoItem.anchor}</span>
      <div>
        <button class="edit" onclick="editVideo('${videoItem.id}')">Edit</button>
        <button onclick="deleteVideo('${videoItem.id}')">Delete</button>
      </div>
    `;
    videoListContainer.appendChild(videoElement);
  });
}

function clearVideoForm() {
  document.getElementById('videoUrl').value = '';
  document.getElementById('videoAnchor').value = '';
  document.getElementById('videoThumbnail').value = '';
  document.getElementById('cancelEditVideo').classList.remove('show');
}

function editVideo(videoId) {
  var videoItem = videoList.find(function(video) {
    return video.id === videoId;
  });

  document.getElementById('videoUrl').value = `https://www.youtube.com/watch?v=${videoItem.id}`;
  document.getElementById('videoAnchor').value = videoItem.anchor;
  document.getElementById('videoThumbnail').value = videoItem.thumbnail;
  document.getElementById('cancelEditVideo').classList.add('show');
}

function deleteVideo(videoId) {
  var confirmDelete = confirm('Are you sure you want to delete this video?');
  if (confirmDelete) {
    videoList = videoList.filter(function(video) {
      return video.id !== videoId;
    });
    saveData();
    renderVideoList();
    showSuccessMessage("Video deleted successfully");
  }
}

function cancelEdit(type) {
  if (type === 'video') {
    clearVideoForm();
  } else if (type === 'article') {
    clearArticleForm();
  }
}

function showSuccessMessage(message) {
  var uploadBar = document.getElementById('uploadBar');
  var uploadStatus = document.getElementById('uploadStatus');
  uploadStatus.innerText = message;
  uploadBar.style.display = 'block';
  setTimeout(function() {
    uploadBar.style.display = 'none';
  }, 3000);
}

function addArticle() {
  var title = document.getElementById('articleTitle').value;
  var content = document.getElementById('articleContent').value;
  var seoTags = document.getElementById('seoTags').value;

  if (title && content) {
    var articleItem = {
      title: title,
      content: content,
      seoTags: seoTags,
      updated: new Date(),
    };

    articleList.push(articleItem);
    saveData();
    renderArticleList();
    clearArticleForm();
    showSuccessMessage("Article added successfully");
  }
}

function renderArticleList() {
  var articleListContainer = document.getElementById('articleList');
  articleListContainer.innerHTML = '';

  articleList.forEach(function(articleItem) {
    var articleElement = document.createElement('div');
    articleElement.className = 'article-item';
    articleElement.innerHTML = `
      <div>
        <h3>${articleItem.title}</h3>
        <p>${articleItem.content}</p>
        <p class="updated">Last updated ${timeSince(articleItem.updated)}</p>
      </div>
      <div>
        <button class="edit" onclick="editArticle('${articleItem.title}')">Edit</button>
        <button onclick="deleteArticle('${articleItem.title}')">Delete</button>
      </div>
    `;
    articleListContainer.appendChild(articleElement);
  });
}

function clearArticleForm() {
  document.getElementById('articleTitle').value = '';
  document.getElementById('articleContent').value = '';
  document.getElementById('seoTags').value = '';
  document.getElementById('cancelEditArticle').classList.remove('show');
}

function editArticle(title) {
  var articleItem = articleList.find(function(article) {
    return article.title === title;
  });

  document.getElementById('articleTitle').value = articleItem.title;
  document.getElementById('articleContent').value = articleItem.content;
  document.getElementById('seoTags').value = articleItem.seoTags;
  document.getElementById('cancelEditArticle').classList.add('show');
}

function deleteArticle(title) {
  var confirmDelete = confirm('Are you sure you want to delete this article?');
  if (confirmDelete) {
    articleList = articleList.filter(function(article) {
      return article.title !== title;
    });
    saveData();
    renderArticleList();
    showSuccessMessage("Article deleted successfully");
  }
}

function update(type) {
  if (type === 'video') {
    var url = document.getElementById('videoUrl').value;
    var anchor = document.getElementById('videoAnchor').value;
    var thumbnail = document.getElementById('videoThumbnail').value;

    if (url && anchor && thumbnail) {
      var videoId = extractVideoId(url);

      var videoItem = videoList.find(function(video) {
        return video.id === videoId;
      });

      if (videoItem) {
        videoItem.anchor = anchor;
        videoItem.thumbnail = thumbnail;
      }
      saveData();
      renderVideoList();
      clearVideoForm();
    }
  } else if (type === 'article') {
    var title = document.getElementById('articleTitle').value;
    var content = document.getElementById('articleContent').value;
    var seoTags = document.getElementById('seoTags').value;

    if (title && content) {
      var articleItem = articleList.find(function(article) {
        return article.title === title;
      });

      if (articleItem) {
        articleItem.content = content;
        articleItem.seoTags = seoTags;
        articleItem.updated = new Date();
      }
      saveData();
      renderArticleList();
      clearArticleForm();
    }
  }

  var confirmUpdate = confirm('Are you sure you want to update this ' + type + '?');
  if (confirmUpdate) {
    showSuccessMessage(type.charAt(0).toUpperCase() + type.slice(1) + " updated successfully");
  }
}

function timeSince(date) {
  var seconds = Math.floor((new Date() - new Date(date)) / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      videoList = data.videos || [];
      articleList = data.articles || [];
      renderVideoList();
      renderArticleList();
    })
    .catch(error => console.error('Error loading data:', error));
}

function saveData() {
  const data = {
    videos: videoList,
    articles: articleList
  };
  fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log('Data saved successfully:', data))
  .catch(error => console.error('Error saving data:', error));
}

window.onload = function() {
  loadData();
}

// Initial render
renderVideoList();
renderArticleList();
