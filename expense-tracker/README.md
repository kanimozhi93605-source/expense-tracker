# SpendWise – Personal Expense Tracker

A simple, modern website to track daily income and expenses, set a monthly budget and understand your spending.
Built with plain **HTML, CSS and JavaScript**. No Node.js, no backend, no build step.
All data is saved in your browser's **LocalStorage**, so it is still there after you refresh the page.

## Features

- **Dashboard** – total balance, income, expenses, recent transactions, monthly expense chart, income vs expense chart
- **Add Transaction** – income or expense, title, amount, category, date, payment method, description; edit and delete anytime
- **History** – table with search, filters (type, category, date range) and newest/oldest sorting
- **Budget** – monthly budget, amount spent, remaining amount, progress bar and an over-budget warning
- **Reports** – monthly summary, category-wise breakdown, weekly and monthly spending charts, CSV download
- **Settings** – currency (₹ INR by default), light/dark mode, clear all data (with confirmation)
- Responsive layout for desktop, tablet and mobile

## Folder structure

```
expense-tracker/
├── index.html   – page structure (all screens)
├── style.css    – design, colours, dark mode, responsive rules
├── script.js    – all app logic
└── README.md    – this file
```

## How to run

1. Open the `expense-tracker` folder.
2. Double-click `index.html` (it opens in your default browser).

That's it. For a nicer workflow, open the folder in VS Code and use the **Live Server** extension
(right-click `index.html` → *Open with Live Server*).

> The charts use Chart.js from a CDN, so you need an internet connection the first time the page loads.
> Everything else works offline. If you are offline, the charts show a short message instead.

## Open in VS Code

1. Open VS Code → **File → Open Folder…** → choose `expense-tracker`.
2. (Optional) Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` → **Open with Live Server**.

## Upload to GitHub

Using the terminal (inside the `expense-tracker` folder):

```bash
git init
git add .
git commit -m "Add SpendWise expense tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/expense-tracker.git
git push -u origin main
```

Create the empty repository first on github.com (**New repository**, do not add a README there).

No Git? On github.com open your repository → **Add file → Upload files** → drag the four files in → **Commit changes**.

## Deploy with Vercel

**Option A – Dashboard (easiest)**

1. Push the project to GitHub (see above).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New… → Project** and import your `expense-tracker` repository.
4. Keep the defaults (Framework Preset: **Other**, no build command, no output directory) and click **Deploy**.
5. Vercel gives you a live link such as `https://expense-tracker.vercel.app`.

**Option B – Vercel CLI**

```bash
npm i -g vercel
vercel          # follow the prompts, answer the defaults
vercel --prod   # publish to production
```

You can also deploy for free with **GitHub Pages**: repository **Settings → Pages → Deploy from a branch → main / (root)**.

## How your data is stored

- Data lives in your browser's LocalStorage under the key `spendwise.v1`.
- It stays on your device, on that browser only. Other browsers or devices will not see it.
- Clearing your browser's site data, or using **Settings → Clear Data**, deletes it.
- Changing the currency only changes how amounts are displayed. Saved numbers are not converted.

## Tips

- Use the **Download CSV** button in Reports to back up or open your data in Excel / Google Sheets.
- A budget applies to every calendar month. It turns amber at 80% spent and red when exceeded.
- Categories **Salary** and **Freelance** are available for income. **Other** works for both.

## Customising

- **Colours**: change the variables at the top of `style.css` (`--primary` is the main purple).
- **Categories**: edit `EXPENSE_CATEGORIES`, `INCOME_CATEGORIES` and `CATEGORY_STYLE` at the top of `script.js`.
- **Currencies**: add an entry to `CURRENCIES` in `script.js`.
