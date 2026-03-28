import { connect, PageWithCursor } from './lib/browser/br';
import { Browser } from 'rebrowser-puppeteer-core';
import fs from 'fs';
import path from 'path';

/**
 * Replicates the ObsidianBots flow with a stealthy browser.
 */

async function getObsidianUrl(slug: string) {
    console.log(`[*] Starting flow for slug: ${slug}...`);

    const targetUrl = `https://v3.obsidianbots.site/${slug}`;
    const referer = 'https://inshorturl.in/';

    const { browser, page } = await connect({
        headless: true, // Use headless for execution environment
        turnstile: true, // Enable the turnstile solver from br.ts
    });

    try {
        // 1. Set the referer
        await page.setExtraHTTPHeaders({ 'Referer': referer });

        // 2. Intercept the API response
        let finalUrl = null;
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('stream.obsidianbots.site/api')) {
                try {
                    const data = await response.json();
                    if (data && data.success && data.url) {
                        finalUrl = data.url;
                        console.log(`[+] Intercepted Final URL: ${finalUrl}`);
                    }
                } catch (e) {
                    // Not a JSON or other error
                }
            }
        });

        // 3. Navigate to the target
        console.log(`[*] Navigating to ${targetUrl}...`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2' });

        // 4. Wait for redirect or success
        // The page usually redirects to t.me automatically after success
        console.log(`[*] Waiting for success signal or redirect...`);
        
        const timeout = 30000;
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (finalUrl) break;
            if (page.url().includes('t.me/')) {
                finalUrl = page.url();
                console.log(`[+] Redirected to Final URL: ${finalUrl}`);
                break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (finalUrl) {
            console.log(`\n========================================`);
            console.log(`SUCCESS! Final URL: ${finalUrl}`);
            console.log(`========================================\n`);
            return finalUrl;
        } else {
            console.error(`[-] Failed to retrieve URL within ${timeout/1000} seconds.`);
            const content = await page.content();
            if (content.includes('BYPASS DETECTED')) {
                console.error(`[!] Detection triggered: 'BYPASS DETECTED' visible on page.`);
            } else if (content.includes('Access denied')) {
                console.error(`[!] Detection triggered: 'Access denied' visible on page.`);
            }
        }

    } catch (error: any) {
        console.error(`[-] Error: ${error.message}`);
    } finally {
        await browser.close();
    }
}

const targetSlug = process.argv[2] || 'WBQP';
getObsidianUrl(targetSlug);
