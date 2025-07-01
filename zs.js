const puppeteer = require('puppeteer');

async function claimKasFaucet(walletAddress) {
  if (!walletAddress || !walletAddress.startsWith('0x')) {
    console.error('Please provide a valid Ethereum-format wallet address starting with 0x');
    return;
  }

  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  try {
    await page.goto('https://faucet.zealousswap.com/', { waitUntil: 'networkidle2' });
    console.log('Faucet page loaded');

    // Wait for wallet address input box
    const inputSelector = 'input[type="text"][placeholder*="Wallet Address"]';
    await page.waitForSelector(inputSelector, { timeout: 15000 });

    // Clear and type wallet address
    await page.evaluate((selector) => {
      document.querySelector(selector).value = '';
    }, inputSelector);
    await page.type(inputSelector, walletAddress);
    console.log(`Entered wallet address: ${walletAddress}`);

    // Wait for Claim button and click it
    const claimButtonSelector = 'button:has-text("Claim 50 KAS")';
    // Puppeteer doesn't support :has-text natively, so find by XPath instead:
    const [claimButton] = await page.$x("//button[contains(., 'Claim 50 KAS')]");
    if (!claimButton) {
      console.error('Claim button not found or faucet may be under maintenance.');
      await browser.close();
      return;
    }

    await claimButton.click();
    console.log('Clicked Claim 50 KAS button');

    // Wait for confirmation or queue message
    // Adjust selector below to actual confirmation message container
    const confirmationSelector = '.success-message, .alert-success, .queue-status';
    await page.waitForSelector(confirmationSelector, { timeout: 20000 });
    const message = await page.$eval(confirmationSelector, el => el.innerText);
    console.log('Faucet response:', message);

  } catch (error) {
    console.error('Error during faucet claim:', error);
  } finally {
    // Optional: keep browser open for manual inspection or close it
    // await browser.close();
  }
}

// Replace this with your KAS testnet wallet address (Ethereum format)
const myWalletAddress = '0xYourWalletAddressHere';

claimKasFaucet(myWalletAddress);
