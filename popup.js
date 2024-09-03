document.addEventListener('DOMContentLoaded', function() {
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const bookmarkText = document.getElementById('bookmarkText');

  bookmarkBtn.addEventListener('click', () => {
    const customText = bookmarkText.value.trim();

    if (!customText) {
      alert("Please enter a custom note for the bookmark.");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { type: 'getCurrentTimestamp' }, (response) => {
        if (response) {
          chrome.storage.local.get('bookmarks', (data) => {
            const bookmarks = data.bookmarks || [];
            const newBookmark = {
              url: activeTab.url,
              title: activeTab.title,
              timestamp: response.currentTime,
              text: customText
            };
            bookmarks.push(newBookmark);
            chrome.storage.local.set({ bookmarks }, () => {
              displayBookmarks();
            });
          });
        }
      });
    });

    bookmarkText.value = ''; // Clear the input after saving
  });

  displayBookmarks(); // Ensure bookmarks are displayed on load
});

function displayBookmarks() {
  chrome.storage.local.get('bookmarks', (data) => {
    const bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = '';

    (data.bookmarks || []).forEach((bookmark, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'bookmark-item';

      const textContainer = document.createElement('div');
      textContainer.className = 'text-container';

      const title = document.createElement('span');
      title.className = 'bookmark-title';
      title.textContent = bookmark.text;

      const time = document.createElement('span');
      time.className = 'bookmark-time';
      time.textContent = formatTime(bookmark.timestamp);

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'edit-btn';
      editBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering the list item click event
        const newText = prompt('Edit your bookmark note:', bookmark.text);
        if (newText !== null) {
          bookmark.text = newText.trim();
          updateBookmark(index, bookmark);
        }
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent triggering the list item click event
        deleteBookmark(index);
      });

      textContainer.appendChild(title);
      textContainer.appendChild(time);
      textContainer.appendChild(editBtn);
      textContainer.appendChild(deleteBtn);

      listItem.appendChild(textContainer);

      listItem.addEventListener('click', () => {
        chrome.tabs.create({ url: `${bookmark.url}&t=${Math.floor(bookmark.timestamp)}s` });
      });

      bookmarkList.appendChild(listItem);
    });
  });
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateBookmark(index, updatedBookmark) {
  chrome.storage.local.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    bookmarks[index] = updatedBookmark;
    chrome.storage.local.set({ bookmarks }, () => {
      displayBookmarks();
    });
  });
}

function deleteBookmark(index) {
  chrome.storage.local.get('bookmarks', (data) => {
    const bookmarks = data.bookmarks || [];
    bookmarks.splice(index, 1);
    chrome.storage.local.set({ bookmarks }, () => {
      displayBookmarks();
    });
  });
}
