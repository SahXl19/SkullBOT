// Constants and configurations
const CONFIG = {
    SPEECH: {
        INIT_MESSAGE: "Initializing Virtual Assistant...",
        LISTENING_MESSAGE: "Listening...",
        SEARCH_MESSAGE: "Searching for information about",
        GREETING: "Hello Sir, How May I Help You?"
    },
    COMMANDS: {
        SEARCH_PATTERNS: ['what is', 'who is', 'what are', 'how to', 'where is'],
        GOOGLE_TRIGGER: 'open google',
        GREETING_PATTERNS: ['hey', 'hello', 'hi'],
        TIME_PATTERNS: ['what time', 'current time', 'time now'],
        DATE_PATTERNS: ['what date', 'current date', 'date today'],
        WEATHER_PATTERNS: ['weather', 'temperature', 'forecast']
    },
    URLS: {
        GOOGLE: 'https://google.com',
        YOUTUBE: 'https://youtube.com',
        FACEBOOK: 'https://facebook.com',
        TWITTER: 'https://twitter.com',
        INSTAGRAM: 'https://instagram.com',
        LINKEDIN: 'https://linkedin.com',
        GITHUB: 'https://github.com',
        WIKIPEDIA: 'https://en.wikipedia.org/wiki/',
        WEATHER_API: 'https://api.openweathermap.org/data/2.5/weather'
    },
    DELAYS: {
        MOCK_SEARCH: 500,
        TYPING_SPEED: 50
    }
};

// Command Handler Class (Updated)
class CommandHandler {
    constructor(speechManager) {
        this.speechManager = speechManager;
        this.searchManager = new SearchManager();
        this.commands = this.setupCommands();
    }

    setupCommands() {
        return {
            greeting: {
                patterns: CONFIG.COMMANDS.GREETING_PATTERNS,
                action: async () => {
                    await this.speechManager.speak(CONFIG.SPEECH.GREETING);
                }
            },
            openWebsite: {
                patterns: ['open'],
                action: async (message) => {
                    await this.handleWebsiteCommand(message);
                }
            },
            search: {
                patterns: CONFIG.COMMANDS.SEARCH_PATTERNS,
                action: async (query) => {
                    await this.handleSearchCommand(query);
                }
            },
            wikipedia: {
                patterns: ['wikipedia'],
                action: async (query) => {
                    await this.handleWikipediaCommand(query);
                }
            },
            time: {
                patterns: CONFIG.COMMANDS.TIME_PATTERNS,
                action: async () => {
                    await this.handleTimeCommand();
                }
            },
            date: {
                patterns: CONFIG.COMMANDS.DATE_PATTERNS,
                action: async () => {
                    await this.handleDateCommand();
                }
            },
            weather: {
                patterns: CONFIG.COMMANDS.WEATHER_PATTERNS,
                action: async (query) => {
                    await this.handleWeatherCommand(query);
                }
            },
            calculator: {
                patterns: ['calculator', 'compute', 'calculate'],
                action: async (query) => {
                    await this.handleCalculatorCommand(query);
                }
            },
            reminder: {
                patterns: ['remind me', 'set reminder', 'reminder'],
                action: async (query) => {
                    await this.handleReminderCommand(query);
                }
            },
            jokes: {
                patterns: ['tell joke', 'tell me a joke', 'joke'],
                action: async () => {
                    await this.handleJokeCommand();
                }
            },
            news: {
                patterns: ['news', 'latest news', 'headlines'],
                action: async (query) => {
                    await this.handleNewsCommand(query);
                }
            }
        };
    }

    async handleWebsiteCommand(message) {
        const websites = {
            google: CONFIG.URLS.GOOGLE,
            youtube: CONFIG.URLS.YOUTUBE,
            facebook: CONFIG.URLS.FACEBOOK,
            twitter: CONFIG.URLS.TWITTER,
            instagram: CONFIG.URLS.INSTAGRAM,
            linkedin: CONFIG.URLS.LINKEDIN,
            github: CONFIG.URLS.GITHUB
        };

        for (const [site, url] of Object.entries(websites)) {
            if (message.includes(site)) {
                window.open(url, "_blank");
                await this.speechManager.speak(`Opening ${site}...`);
                return true;
            }
        }
        return false;
    }

    async handleTimeCommand() {
        const time = new Date().toLocaleString(undefined, { 
            hour: "numeric", 
            minute: "numeric",
            second: "numeric",
            hour12: true 
        });
        const finalText = `The current time is ${time}`;
        await this.speechManager.speak(finalText);
    }

    async handleDateCommand() {
        const date = new Date().toLocaleString(undefined, { 
            weekday: 'long',
            year: 'numeric',
            month: "long", 
            day: "numeric"
        });
        const finalText = `Today's date is ${date}`;
        await this.speechManager.speak(finalText);
    }

    async handleWikipediaCommand(query) {
        const searchTerm = query.replace("wikipedia", "").trim();
        const url = `${CONFIG.URLS.WIKIPEDIA}${encodeURIComponent(searchTerm)}`;
        window.open(url, "_blank");
        const finalText = `This is what I found on Wikipedia regarding ${searchTerm}`;
        await this.speechManager.speak(finalText);
    }

    async handleCalculatorCommand(query) {
        try {
            // Simple arithmetic expression parser
            const expression = query.replace(/(calculate|compute|calculator)/i, '').trim();
            if (expression) {
                // Safely evaluate mathematical expression
                const result = this.safeEval(expression);
                const finalText = `The result of ${expression} is ${result}`;
                await this.speechManager.speak(finalText);
            } else {
                // Open calculator interface
                window.location.href = "calculator.html";
                await this.speechManager.speak("Opening Calculator");
            }
        } catch (error) {
            await this.speechManager.speak("I couldn't process that calculation. Please try again.");
        }
    }

    safeEval(expression) {
        // Sanitize and evaluate mathematical expressions safely
        const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
        return Function(`'use strict'; return (${sanitized})`)();
    }

    async handleReminderCommand(query) {
        const reminderText = query.replace(/(remind me|set reminder|reminder)/i, '').trim();
        if (reminderText) {
            const reminder = {
                text: reminderText,
                timestamp: new Date().getTime()
            };
            
            // Store reminder in localStorage
            const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
            reminders.push(reminder);
            localStorage.setItem('reminders', JSON.stringify(reminders));
            
            await this.speechManager.speak(`I'll remind you to ${reminderText}`);
            
            // Set up notification
            this.scheduleNotification(reminder);
        }
    }

    async handleJokeCommand() {
        const jokes = [
            "Why don't programmers like nature? It has too many bugs.",
            "Why did the computer go to the doctor? Because it had a virus!",
            "What's a computer's favorite beat? An algorithm!",
            "Why do programmers always mix up Halloween and Christmas? Because Oct 31 equals Dec 25!"
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        await this.speechManager.speak(joke);
    }

    async handleNewsCommand(query) {
        const category = query.includes('tech') ? 'technology' :
                        query.includes('sport') ? 'sports' :
                        query.includes('business') ? 'business' : 'general';
        
        try {
            // Simulated news API response
            const news = await this.fetchNews(category);
            await this.speechManager.speak(`Here are the latest ${category} headlines`);
            this.displayNews(news);
        } catch (error) {
            await this.speechManager.speak("Sorry, I couldn't fetch the latest news.");
        }
    }

    async fetchNews(category) {
        // Simulate API call - replace with actual news API integration
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { title: `Latest ${category} news 1`, description: "News description 1" },
                    { title: `Latest ${category} news 2`, description: "News description 2" },
                    { title: `Latest ${category} news 3`, description: "News description 3" }
                ]);
            }, 1000);
        });
    }

    displayNews(news) {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.innerHTML = news.map(item => `
                <div class="news-item">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `).join('');
        }
    }

    scheduleNotification(reminder) {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setTimeout(() => {
                        new Notification('Reminder', {
                            body: reminder.text,
                            icon: 'notification-icon.png'
                        });
                    }, 5000); // Show notification after 5 seconds (adjust as needed)
                }
            });
        }
    }

    async handleCommand(message) {
        try {
            message = message.toLowerCase();
            let handled = false;

            for (const [category, commandInfo] of Object.entries(this.commands)) {
                if (commandInfo.patterns.some(pattern => message.includes(pattern))) {
                    await commandInfo.action(message);
                    handled = true;
                    break;
                }
            }

            if (!handled) {
                // Default search behavior
                await this.commands.search.action(message);
            }
        } catch (error) {
            console.error('Error in command handling:', error);
            this.searchManager.displayError('Failed to process command. Please try again.');
        }
    }
}

// The rest of the code (SpeechManager, SearchManager, App classes) remains the same
