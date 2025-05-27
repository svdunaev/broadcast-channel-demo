class ReadingProgressTracker {
  constructor() {
    this.progressBar = document.getElementById("progressBar");
    this.progressInfo = document.getElementById("progressInfo");
    this.syncIndicator = document.getElementById("syncIndicator");

    this.channel = new BroadcastChannel("reading-progress-sync");
    this.isUpdatingFromSync = false;
    this.lastSyncTime = 0;
    this.syncTimeout = null;

    this.init();
  }

  init() {
    window.addEventListener("scroll", () => this.updateProgress());

    window.addEventListener("resize", () => this.updateProgress());

    this.channel.addEventListener("message", (event) =>
      this.handleSyncMessage(event)
    );

    window.addEventListener("beforeunload", () => this.cleanup());

    this.updateProgress();
  }

  updateProgress(fromSync = false) {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercentage =
      scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

    const clampedPercentage = Math.min(Math.max(scrollPercentage, 0), 100);

    this.progressBar.style.width = `${clampedPercentage}%`;

    const roundedPercentage = Math.round(clampedPercentage);
    const remainingPercentage = 100 - roundedPercentage;

    if (roundedPercentage === 100) {
      this.progressInfo.textContent = "Complete! 🎉";
    } else {
      this.progressInfo.textContent = `${roundedPercentage}% Complete (${remainingPercentage}% remaining)`;
    }

    if (clampedPercentage > 90) {
      this.progressBar.style.boxShadow = "0 0 15px rgba(102, 126, 234, 0.8)";
    } else {
      this.progressBar.style.boxShadow = "0 0 10px rgba(102, 126, 234, 0.5)";
    }

    if (!fromSync) {
      this.broadcastProgress(clampedPercentage, scrollTop);
    }
  }

  broadcastProgress(percentage, scrollPosition) {
    const now = Date.now();

    if (now - this.lastSyncTime < 100) {
      return;
    }

    this.lastSyncTime = now;

    this.channel.postMessage({
      type: "PROGRESS_UPDATE",
      data: {
        percentage: percentage,
        scrollPosition: scrollPosition,
        timestamp: now,
      },
    });

    this.showSyncIndicator("Syncing...", "sync-out");
  }

  handleSyncMessage(event) {
    if (event.data.type === "PROGRESS_UPDATE") {
      const { percentage, scrollPosition, timestamp } = event.data.data;

      // Only sync if the other tab's progress is ahead of ours
      const currentScrollPercentage = this.getCurrentScrollPercentage();

      if (percentage > currentScrollPercentage) {
        this.syncToPosition(scrollPosition, percentage);
        this.showSyncIndicator("Synced from other tab", "synced-from-other");
      }
    }
  }

  getCurrentScrollPercentage() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollableHeight = documentHeight - windowHeight;

    return scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
  }

  syncToPosition(scrollPosition) {
    this.isUpdatingFromSync = true;

    window.scrollTo({
      top: scrollPosition,
      behavior: "smooth",
    });

    setTimeout(() => {
      this.updateProgress(true);
      this.isUpdatingFromSync = false;
    }, 100);
  }

  showSyncIndicator(message, className = "") {
    this.syncIndicator.textContent = message;
    this.syncIndicator.className = `sync-indicator show ${className}`;

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.syncIndicator.classList.remove("show");
    }, 2000);
  }

  cleanup() {
    this.channel.close();

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ReadingProgressTracker();
});
