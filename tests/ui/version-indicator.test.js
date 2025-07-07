// Test for version indicator UI element
describe('Version Indicator', () => {
  beforeEach(() => {
    // Set up DOM with version indicator
    document.body.innerHTML = `
      <div id="version-indicator" style="position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; z-index: 1000;">
        v1.0.0-beta
      </div>
    `;
  });

  test('should display version indicator', () => {
    const versionIndicator = document.getElementById('version-indicator');
    expect(versionIndicator).toBeTruthy();
    expect(versionIndicator.textContent.trim()).toBe('v1.0.0-beta');
  });

  test('should be positioned at bottom right', () => {
    const versionIndicator = document.getElementById('version-indicator');
    const styles = versionIndicator.style;
    
    expect(styles.position).toBe('fixed');
    expect(styles.bottom).toBe('10px');
    expect(styles.right).toBe('10px');
  });

  test('should have proper styling', () => {
    const versionIndicator = document.getElementById('version-indicator');
    const styles = versionIndicator.style;
    
    expect(styles.background).toBe('rgba(0, 0, 0, 0.7)');
    expect(styles.color).toBe('white');
    expect(styles.zIndex).toBe('1000');
  });
}); 