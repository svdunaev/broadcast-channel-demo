class ReadingProgressTracker {
	constructor() {
		this.progressBar = document.getElementById('progressBar')
		this.progressInfo = document.getElementById('progressInfo')

		this.init()
	}

	init() {
		//update progress on scroll
		window.addEventListener('scroll', () => this.updateProgress())

		//update progress on resize
		window.addEventListener('resize', () => this.updateProgress())

		//initial progress calculation
		this.updateProgress()
	}

	updateProgress() {
		const windowHeight = window.innerHeight
		const documentHeight = document.documentElement.scrollHeight
		const scrollTop = window.scrollY

		//calculate how much of document has been scrolled
		const scrollableHeight = documentHeight - windowHeight
		const scrollPercentage = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;

		const clampedPercentage = Math.min(Math.max(scrollPercentage, 0), 100)


		//update progress bar
		this.progressBar.style.width = `${clampedPercentage}%`

		//update progress info
		const roundedPercentage = Math.round(clampedPercentage)
		const remainingPercentage = 100 - roundedPercentage

		if(roundedPercentage === 100) { 
			this.progressInfo.textContent = 'Complete! 🎉'
		} else {
			this.progressInfo.textContent = `${roundedPercentage}% Complete (${remainingPercentage}% remaining)`
		}

		//add some visual feedback when nearing completion
		if(clampedPercentage > 90) {
			this.progressBar.style.boxShadow = '0 0 15px rgba(102, 126, 234, 0.8)'
		} else {
			this.progressBar.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
		}
	}
} 

document.addEventListener('DOMContentLoaded', () => {
	new ReadingProgressTracker()
})