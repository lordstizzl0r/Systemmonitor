# System Monitor

![System Monitor](icons/png/256x256.png)

A sleek, lightweight desktop widget that monitors your system resources in real-time. Built with Electron for cross-platform compatibility.

## 🖥️ Features

- Real-time monitoring of CPU usage
- Memory utilization tracking
- Disk space monitoring
- Network traffic analysis
- Compact widget in mini-mode
- Detailed view with graphs and process information in expanded mode
- Fully customizable transparent interface
- Cross-platform support (Windows, macOS, Linux)

## 📸 Screenshots

![Mini Widget](docs/screenshots/mini-widget.png)
![Expanded View](docs/screenshots/expanded-view.png)

## 🚀 Installation

### Windows

Install via Chocolatey:

```
choco install systemmonitor
```

Or download the latest installer from the [Releases](https://github.com/lordstizzl0r/system-monitor/releases) page.

### macOS and Linux

Download the appropriate package from the [Releases](https://github.com/lordstizzl0r/system-monitor/releases) page.

## 🔧 Development

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Git

### Setup

1. Clone the repository

   ```
   git clone https://github.com/lordstizzl0r/system-monitor.git
   cd system-monitor
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Start development server
   ```
   npm run dev
   ```

### Building

Create a production build for your current platform:

```
npm run dist
```

Or build for a specific platform:

```
npm run dist-win    # Windows
npm run dist-mac    # macOS
npm run dist-linux  # Linux
```

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how you can contribute:

### Ways to Contribute

- 🐛 **Bug Reports**: Create a detailed issue with steps to reproduce
- 💡 **Feature Requests**: Suggest new features or improvements
- 🧪 **Testing**: Test the application on different platforms/systems
- 📝 **Documentation**: Improve or extend the documentation
- 💻 **Code Contributions**: Submit pull requests with bug fixes or new features

### Contribution Process

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, commented, and testable code
- Update documentation for any new features
- Add appropriate tests for new functionality
- Test your changes thoroughly before submitting a PR

## 🛠️ Tech Stack

- [Electron](https://www.electronjs.org/) - Cross-platform desktop app framework
- [Chart.js](https://www.chartjs.org/) - Interactive charts
- [systeminformation](https://www.npmjs.com/package/systeminformation) - System metrics collection
- [ffmpeg](https://ffmpeg.org/) - Media processing capabilities
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Contact

Ruben Seelmeyer

- GitHub: [lordstizzl0r](https://github.com/lordstizzl0r)
- Project Link: [https://github.com/lordstizzl0r/system-monitor](https://github.com/lordstizzl0r/system-monitor)

---

<p align="center">
  Made with ❤️ by the System Monitor community
</p>
