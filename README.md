# ToonEngine: Token-Oriented Object Notation

![Version](https://img.shields.io/badge/version-3.1.2-indigo)
![Status](https://img.shields.io/badge/status-stable-emerald)
![License](https://img.shields.io/badge/license-MIT-blue)

ToonEngine is a high-performance transformer designed to optimize JSON payloads for Large Language Model (LLM) token efficiency. By utilizing **TOON (Token-Oriented Object Notation)**, you can reduce token consumption by up to **30-50%**, leading to faster inference times and significantly lower API costs.

## 🚀 Key Features

- **TOON Serialization**: A minimalist, key-folded, and tabular-aware notation format optimized for LLM tokenizers (tiktoken).
- **Token Efficiency Calculator**: Real-time cost and savings projection for models like GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro.
- **Differential Workspace**: Side-by-side comparison between JSON and TOON with visual diff highlighting and token delta tracking.
- **Premium Studio UI**: A cinematic, developer-first interface built for high-scale LLM pipeline optimization.
- **Bidirectional Conversion**: Seamlessly convert between JSON and TOON with built-in validation.

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion (Glassmorphism & Micro-animations)
- **Tokenization**: `js-tiktoken` for accurate token counts across different models.
- **Diff Engine**: `react-diff-viewer-continued`

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sajar-mohammed/toon-converter.git
   cd toon-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📖 How TOON Works

TOON reduces token overhead through several key optimizations:

1. **Key Folding**: Combines nested object keys (e.g., `user.settings.theme`) to reduce structural depth tokens.
2. **Tabular Arrays**: Identifies uniform object arrays and represents them as headers followed by comma-separated values, eliminating redundant key-value pairs.
3. **Minimalist Delimiters**: Replaces heavy JSON syntax (`{`, `"`, `}`, `: `) with optimized delimiters that use fewer tokens in the BPE (Byte Pair Encoding) space.

### Example

**JSON:**
```json
[
  { "id": 1, "name": "Alice", "role": "admin" },
  { "id": 2, "name": "Bob", "role": "user" }
]
```

**TOON:**
```text
[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Sajar Mohammed](https://github.com/sajar-mohammed)
