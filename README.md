# Luxcraft Interior Design Website

A modern, responsive website for Luxcraft Interior Design company showcasing their portfolio, services, and company information.

## Features

- Responsive design using Tailwind CSS
- Modern and clean user interface
- Portfolio gallery
- Service listings
- Contact form
- About page with company information

## Technologies Used

- HTML5
- CSS3
- Tailwind CSS
- PostCSS
- Custom fonts (Corbesier)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd luxcraft-new-site
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
# Command to run development server if applicable
```

## Project Structure

```
├── assets/
│   ├── styles.css
│   ├── corbesier-icons.css
│   ├── fonts/
│   └── images/
├── src/
│   └── styles/
│       └── tailwind.css
├── index.html
├── about.html
├── services.html
├── portfolio.html
├── contact.html
└── README.md
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Contact enquiry privacy

The root `.htaccess` denies public access to legacy logs, PHP error logs and
retired mail diagnostics, including files left behind by earlier deployments.
The deployment removes `mail-diagnostics.php` from hosting and checks protected
routes with HEAD requests, without downloading enquiry records.

New operational logs contain only a random reference, UTC timestamp and status.
They are written to `.luxcraft-private` alongside (outside) `public_html`, with
owner-only permissions and 30-day retention. If private storage is unavailable,
only this same metadata is sent to the PHP error log. Enquiry details continue to
be sent by email; routine logging no longer stores those details.

Legacy enquiry logs are deliberately preserved behind the access restriction.
A hosting administrator should privately archive them outside `public_html`,
confirm their retention requirements, and review hosting access logs for past
requests to `/logs/contact-form.log` and `/mail-diagnostics.php`. Do not copy
personal records into GitHub issues, commits or deployment output.

Run regression tests with PHP CLI and Python 3:

```sh
python3 -m unittest discover -s tests -v
```
