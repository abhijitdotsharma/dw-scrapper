import puppeteer from 'puppeteer';

import fs from 'fs';

async function acceptCookiesOnLoad(page, selector) {

    await page.waitForSelector(selector);
    await page.waitForSelector('.cmpboxinner .cmpboxbtns #cmpwelcomebtnyes')
    await page.click('.cmpboxinner .cmpboxbtns #cmpwelcomebtnyes .cmpboxbtn');
    const timestamp = Date.now();
    const date = new Date(timestamp);
    console.log("clicked on accept cookies date-", date)
}

const convertDateToTimestamp = (date) => {
    // Get hours, minutes, and seconds
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const day = date.getDate();

    // Return time as a string (HH:MM:SS format)
    const timeString = `${day}-${hours}-${minutes}-${seconds}`;
    console.log(timeString);

    return timeString;

}

async function downloadWithFetch(page, url, filename) {
    const fileBuffer = await page.evaluate(async (downloadUrl) => {
        const response = await fetch(downloadUrl);
        const arrayBuffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
    }, url);

    // Create downloads directory if it doesn't exist
    if (!fs.existsSync('./downloads')) {
        fs.mkdirSync('./downloads');
    }

    fs.writeFileSync(`./downloads/${filename}`, Buffer.from(fileBuffer));
    console.log(`Downloaded: ${filename}`);
}

async function waitForLessonExtrasResponse(page) {
    return new Promise((resolve) => {
        const responseHandler = async (response) => {
            const url = response.url();
            if (url.includes('graphql?operationName=LessonExtrasPage')) {
                try {
                    const responseBody = await response.json();
                    page.off('response', responseHandler); // Remove this specific listener
                    resolve(responseBody);
                } catch (error) {
                    console.log('Could not parse LessonExtras response as JSON', error);
                    page.off('response', responseHandler);
                    resolve(null);
                }
            }
        };
        page.on('response', responseHandler);
    });
}


async function main() {

    const timestamp = Date.now();
    const date = new Date(timestamp);
    console.log("running main()", date);


    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://learngerman.dw.com/en/nicos-weg/c-36519789');
    await page.setViewport({ width: 1080, height: 1024 });

    let chapterURL;
    let CHAPTERS = [];

    const coursePagePromise = new Promise((resolve) => {
        const responseHandler = async (response) => {
            const url = response.url();
            if (url.includes('/graphql?operationName=CoursePage')) {
                try {
                    const responseBody = await response.json();
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `graphql-response-${timestamp}.json`;
                    fs.writeFileSync(filename, JSON.stringify(responseBody, null, 2));
                    console.log(`GraphQL response saved to: ${filename}`);

                    page.off('response', responseHandler); // Remove listener
                    resolve(responseBody);
                } catch (error) {
                    console.log('Could not parse CoursePage response as JSON', error);
                    page.off('response', responseHandler);
                    resolve(null);
                }
            }
        }
        page.on('response', responseHandler);
    })

    const courseResponse = await coursePagePromise;
    if (!courseResponse) {
        console.log('Failed to get course page data');
        await browser.close();
        return;
    }

    CHAPTERS = courseResponse.data.content.contentLinks;

    console.log('CHAPTERS - ', CHAPTERS)

    
    for (let i = 0; i < CHAPTERS.length - 1; i++) {
        console.log(`Processing chapter ${i + 1}/${CHAPTERS.length - 1}`);

        const LEARN_GERMAN = `https://learngerman.dw.com`;
        chapterURL = `${LEARN_GERMAN}${CHAPTERS[i].target.namedUrl}/le`;
        console.log('urlofinterest', chapterURL);

        try {
            // Navigate to chapter page
            await page.goto(chapterURL);


            // Wait for the specific response we need
            const lessonResponse = await waitForLessonExtrasResponse(page);

            if (lessonResponse) {
                const FILE_PREFIX = lessonResponse.data.content.name;
                console.log("current chapter ----", FILE_PREFIX);

                const DownloadVocab = lessonResponse.data.content.contentLinks.find(obj => {
                    return obj.name.includes("Download script and vocabulary list");
                });

                const DownloadExercise = lessonResponse.data.content.contentLinks.find(obj => {
                    return obj.name.includes("Download ideas");
                });

                const DOWNLOAD_CONSTANT = `https://static.dw.com/downloads/`;

                // Download files sequentially
                if (DownloadVocab) {
                    const vocabUrl = `${DOWNLOAD_CONSTANT}${DownloadVocab.id}/${DownloadVocab.target.filename}`;
                    try {
                        await downloadWithFetch(page, vocabUrl, `${FILE_PREFIX}-vocabulary-list.pdf`);
                    } catch (error) {
                        console.log(`Failed to download vocab for ${FILE_PREFIX}:`, error);
                    }
                }

                if (DownloadExercise) {
                    const exerciseUrl = `${DOWNLOAD_CONSTANT}${DownloadExercise.id}/${DownloadExercise.target.filename}`;
                    try {
                        await downloadWithFetch(page, exerciseUrl, `${FILE_PREFIX}-exercise-ideas.pdf`);
                    } catch (error) {
                        console.log(`Failed to download exercise for ${FILE_PREFIX}:`, error);
                    }
                }
            } else {
                console.log(`No LessonExtras response for chapter ${i + 1}`);
            }

            // Add delay between chapters to be respectful to the server hehe
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.log(`Error processing chapter ${i + 1}:`, error);
            continue; // Continue with next chapter
        }
    }

    console.log('All chapters processed');
    await browser.close();
}


    
main()
