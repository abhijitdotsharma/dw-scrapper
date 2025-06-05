# German Learning Content Scraper

A Node.js web scraper built with Puppeteer that automatically downloads vocabulary lists and exercise materials from Deutsche Welle's "Nico's Weg" German learning course.


Note: I plan on using this to do more stuff ( like download other info from other sites, or something like that)

## 🎯 What it does

This scraper automatically:
- Navigates to the Nico's Weg course page ( A1 course for now, you can change it to do A2 or B1)
- Extracts all chapter information via GraphQL API calls
- Downloads vocabulary lists and exercise PDFs for each chapter
- Organizes files with descriptive names in a `downloads` folder

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

## 🚀 Installation

1. Clone or download this repository
2. Install dependencies:
```bash
cd dw-scrapper
npm install
```
This will install the necessary things needed

3. Make sure you have **write permissions** in the directory where you'll run the script

## 📁 Project Structure

```
dw-scrapper/
├── script.js          # Main scraper script
├── downloads/          # Created automatically - contains downloaded PDFs
├── graphql-response-*.json  # GraphQL API responses (for debugging)
└── README.md
```

## 💻 Usage

Run the scraper:
```bash
node script.js
```

The script will:
1. Launch a headless Chrome browser
2. Navigate to the Nico's Weg course page
3. Process each chapter sequentially
4. Download available materials for each chapter
5. Save files with descriptive names like:
   - `Chapter-Name-vocabulary-list.pdf`
   - `Chapter-Name-exercise-ideas.pdf`

## 📊 Output

### Downloaded Files
- **Vocabulary Lists**: PDF files containing scripts and vocabulary for each chapter
- **Exercise Ideas**: PDF files with teaching ideas and exercises
- **GraphQL Response**: JSON file containing the course structure (for debugging)

### Console Output
The script provides detailed logging:
```
Processing chapter 1/75
urlofinterest https://learngerman.dw.com/en/nicos-weg/a1-e01-l01/le
current chapter ---- A1 | E01 L01 | Hello!
Downloaded: A1 | E01 L01 | Hello!-vocabulary-list.pdf
Downloaded: A1 | E01 L01 | Hello!-exercise-ideas.pdf
```

## ⚙️ Configuration

### Adjusting Download Behavior

**Change the delay between chapters:**
```javascript
// Current: 1 second delay
await new Promise(resolve => setTimeout(resolve, 1000));

// Increase to 2 seconds for slower scraping
await new Promise(resolve => setTimeout(resolve, 2000));
```

**Process only specific chapters:**
```javascript
// Current: processes all chapters
for (let i = 0; i < CHAPTERS.length - 1; i++) {

// Process only first 10 chapters
for (let i = 0; i < Math.min(10, CHAPTERS.length - 1); i++) {
```

**Enable visible browser (for debugging):**
```javascript
// Current: headless mode
const browser = await puppeteer.launch();

// Visible browser mode
const browser = await puppeteer.launch({ headless: false });
```


## 🛠️ Technical Details

### Key Components

- **`waitForLessonExtrasResponse()`**: Promise-based function that waits for specific GraphQL responses
- **`downloadWithFetch()`**: Downloads files using the browser context to handle authentication
- **Sequential Processing**: Avoids race conditions by processing chapters one at a time

### Error Handling

- Continues processing even if individual chapters fail
- Logs detailed error messages for debugging
- Gracefully handles missing download links
- Includes retry logic for failed downloads

## 🚨 Important Notes

### Rate Limiting
The script includes a 1-second delay between chapter requests to be respectful to Deutsche Welle's servers. **Do not remove or reduce this delay significantly.**

### File Naming
Downloaded files use the chapter names from the course, which may contain special characters. The script handles this automatically.

### Network Requirements
- Stable internet connection required
- The script may take 5-10 minutes to complete depending on the number of chapters
- Large PDF files may take longer to download

## 🐛 Troubleshooting

### Common Issues

**"No LessonExtras response" errors:**
- Some chapters may not have downloadable materials
- This is normal and the script will continue

**Download failures:**
- Check your internet connection
- Verify you have write permissions in the directory
- Some files may be temporarily unavailable

**Browser launch errors:**
- Make sure Puppeteer is properly installed
- On Linux, you may need additional dependencies:
```bash
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## 📝 License

This script is for educational purposes only. Please respect Deutsche Welle's terms of service and use the downloaded materials responsibly.

## 🤝 Contributing

Feel free to submit issues or improvements! Some ideas for enhancements:
- Add support for different language versions
- Implement resume functionality for interrupted downloads
- Add progress bars for better user experience
- Create configuration file for settings

---

**⚠️ Disclaimer**: This tool is not affiliated with Deutsche Welle. Use responsibly and in accordance with their terms of service.