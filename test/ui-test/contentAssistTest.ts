import { expect } from 'chai';
import { WebDriver, VSBrowser, Key, InputBox, TextEditor, ContentAssist, WebElement } from 'vscode-extension-tester';
import { Utilities } from './Utilities';

/**
 * @author Zbynek Cervinka <zcervink@redhat.com>
 */
export function contentAssistSuggestionTest(): void {
  describe('Verify content assist suggests right sugestion', () => {
    it('Content assist suggests right sugestion', async function () {
      this.timeout(30000);

      const driver: WebDriver = VSBrowser.instance.driver;
      await driver.actions().sendKeys(Key.F1).perform();

      let input = await InputBox.create();
      await input.setText('>new file');
      await input.confirm();
      await input.confirm();

      await driver.actions().sendKeys(Key.chord(TextEditor.ctlKey, 's')).perform();
      input = await InputBox.create();
      await input.setText('~/kustomization.yaml');
      await input.confirm();

      // wait until the schema is set and prepared
      (await VSBrowser.instance.driver.wait(async () => {
        this.timeout(10000);
        const utils = new Utilities();
        return await utils.getSchemaLabel('kustomization.yaml');
      }, 10000)) as WebElement | undefined;

      await driver.actions().sendKeys('api').perform();
      const contentAssist: ContentAssist | void = await new TextEditor().toggleContentAssist(true);

      // find if an item with given label is present
      if (contentAssist instanceof ContentAssist) {
        const hasItem = await contentAssist.hasItem('apiVersion');
        if (!hasItem) {
          expect.fail("The 'apiVersion' string did not appear in the content assist's suggestion list.");
        }
      } else {
        expect.fail("The 'apiVersion' string did not appear in the content assist's suggestion list.");
      }
    });

    afterEach(async function () {
      const utils = new Utilities();
      utils.deleteFileInHomeDir('kustomization.yaml');
    });
  });
}
