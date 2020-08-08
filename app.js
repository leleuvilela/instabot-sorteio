const puppeteer = require("puppeteer");

const LOGIN = 'LOGIN'
const SENHA = 'SENHA'
const PUBLICACAO = 'LINK_PUBLICAÇÃO'
const numeroArrobas = '2'

async function start() {

  async function loadMore(page, selector, counter) {
    const moreButton = await page.$(selector);
    if (moreButton) {
      try {
        await moreButton.click();
        counter++;
        console.log(counter);
        await page.waitFor(selector, { timeout: 3000 });
        if (counter < 10) await loadMore(page, selector, counter);
      } catch (e) {
        console.log("timeout");
      }
    }
  }

  async function getUsersComments(page, selector) {
    const comments = await page.$$eval(selector, (links) =>
      links.map((link) => link.innerText)
    );
    return comments;
  }

  function trimComments(comments) {
    const newComments = comments.map((comment) => {
      if (comment[0] === "@") return comment;
    });
    return newComments.filter(function (el) {
      return el != null;
    });
  }

  async function comment(comments, page) {
    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    let text = "";
    let i = 0;
    for (let comment of comments) {
      text = `${text} ${comment}`;
      i++;
      if (i == numeroArrobas) {
        console.log(text);
        const inputComment = await page.waitForXPath(
          "/html/body/div[1]/section/main/div/div[1]/article/div[3]/section[3]/div/form/textarea"
        );
        await inputComment.type(text);
        const commentButton = await page.waitForXPath(
          "/html/body/div[1]/section/main/div/div[1]/article/div[3]/section[3]/div/form/button"
        );
        await commentButton.click();
        await timeout(6000);
        text = "";
        i = 0;
      }
    }
  }


  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--window-size=1200,1000"],
  });

  const page = await browser.newPage();

  await page.goto("https://www.instagram.com/accounts/login/");

  const emailField = await page.waitForXPath(
    "/html/body/div[1]/section/main/div/article/div/div[1]/div/form/div/div[1]/div/label/input"
  );
  const passField = await page.waitForXPath(
    "/html/body/div[1]/section/main/div/article/div/div[1]/div/form/div/div[2]/div/label/input"
  );

  await emailField.type(LOGIN);
  await passField.type(SENHA);

  const loginBtn = await page.waitForXPath(
    "/html/body/div[1]/section/main/div/article/div/div[1]/div/form/div/div[3]/button/div"
  );
  await loginBtn.click();

  await page.waitForNavigation();

  console.log("logou");

  await page.goto(PUBLICACAO);

  let counter = 0;
  await loadMore(page, ".dCJp8.afkep", counter);
  let comments = await getUsersComments(page, ".C4VMK span a");

  comments = trimComments(comments);

  console.log(comments);

  await comment(comments, page);

  await browser.close()

}

start();
