# Contributing to AI Control Center Blueprint

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issues](../../issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](../../issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/willykramer/ai-control-center-blueprint.git
   cd ai-control-center-blueprint
   ```

2. **Set up your development environment**
   ```bash
   # For React components
   cd packages/react-components
   npm install
   
   # For Python backend templates
   cd packages/backend-templates/python-openrouter
   pip install -r requirements.txt
   ```

3. **Run tests**
   ```bash
   # Integration tests
   node test-integration.js
   
   # Component tests
   cd packages/react-components
   npm test
   ```

## Coding Standards

### JavaScript/TypeScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Prefer functional components and hooks

### Python
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings for all functions and classes
- Use meaningful variable names
- Handle errors gracefully

### Documentation
- Update README.md if you change functionality
- Add code comments for complex logic
- Update API documentation for interface changes
- Include examples for new features

## Testing Guidelines

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test complete workflows
- **Documentation Tests**: Ensure examples in docs work
- **Performance Tests**: For cost tracking and API calls

## Feature Requests

We're always looking for suggestions to make this project better. Feature requests are tracked as GitHub issues. When creating a feature request, please include:

- **Clear description** of the feature
- **Motivation** - why is this feature needed?
- **Detailed behavior** - how should it work?
- **Alternatives considered** - what other solutions did you consider?

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Questions?

Feel free to contact the maintainers if you have any questions. You can reach us through GitHub issues or discussions.

---

**Thank you for contributing to AI Control Center Blueprint!** 🎉