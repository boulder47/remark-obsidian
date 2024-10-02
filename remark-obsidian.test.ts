import { remark } from 'remark';
import { remarkObsidian } from 'index'; // Adjust this import path based on your folder structure

// Example test to check if the plugin processes links
describe('remark-obsidian', () => {
  it('should process wiki links', () => {
    const markdownContent = 'This is a [[WikiLink]] example.';
    
    const result = remark()
      .use(remarkObsidian)
      .processSync(markdownContent)
      .toString();

    // Adjust the expected output based on what the plugin should transform
    expect(result).toBe('This is a [[WikiLink]] example.'); // Change to your expected output
  });

  it('should process internal links correctly', () => {
    const markdownContent = '[Link Text](internal-link)';
    
    const result = remark()
      .use(remarkObsidian)
      .processSync(markdownContent)
      .toString();

    expect(result).toBe('[Link Text](internal-link)'); // Adjust based on expected output
  });

  // Add more tests for different functionalities of the plugin
});
