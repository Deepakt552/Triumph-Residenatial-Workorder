# Triumph Workorder Management System

![Logo](public/Logo.png)

A modern, full-stack web application designed to streamline workorder and maintenance requests for property management. Built with Laravel and React, it provides a seamless experience for tenants, managers, and maintenance staff.

## Key Features

-   **Property & Asset Management:** Manage properties, buildings, and individual units.
-   **Maintenance Requests:** Tenants can submit detailed maintenance requests, including descriptions and images.
-   **Status Tracking:** Real-time status updates for all maintenance requests (Submitted, In Progress, Completed, Rejected).
-   **User Roles:** Different roles for administrators, property managers, and tenants.
-   **Email Notifications:** Automated email notifications for request submissions and status changes.
-   **Digital Signatures:** Capture digital signatures to confirm completion of work.
-   **Multi-language Support:** Interface available in multiple languages.
-   **PDF Generation:** Generate PDF summaries of workorders.

## Technology Stack

### Backend
-   [Laravel](https://laravel.com/) (v12)
-   [PHP](https://www.php.net/) (v8.2+)
-   [MySQL](https://www.mysql.com/)
-   [DomPDF](https://github.com/dompdf/dompdf) for PDF generation

### Frontend
-   [React](https://reactjs.org/) (v18)
-   [Inertia.js](https://inertiajs.com/)
-   [Vite](https://vitejs.dev/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Axios](https://axios-http.com/) for HTTP requests
-   [React Signature Canvas](https://github.com/agilgur5/react-signature-canvas) for signatures

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   PHP >= 8.2
-   Composer
-   Node.js & NPM
-   A database server (e.g., MySQL)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd triumph-workorder
    ```

2.  **Install backend dependencies:**
    ```bash
    composer install
    ```

3.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

4.  **Set up your environment:**
    -   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    -   Generate a new application key:
        ```bash
        php artisan key:generate
        ```
    -   Configure your database credentials and other environment variables in the `.env` file.

5.  **Run database migrations:**
    ```bash
    php artisan migrate
    ```

6.  **(Optional) Seed the database with initial data:**
    The project includes seeders for buildings.
    ```bash
    php artisan db:seed
    ```

7.  **Build frontend assets and run the development server:**
    This command will start the Vite development server and the PHP development server concurrently.
    ```bash
    composer run dev
    ```
    Alternatively, you can run them in separate terminals:
    ```bash
    # Terminal 1: Start Vite
    npm run dev

    # Terminal 2: Start Laravel server
    php artisan serve
    ```

8.  **Access the application:**
    Visit `http://127.0.0.1:8000` in your web browser.

## Running Tests

To run the PHPUnit test suite for the application, use the following Artisan command:

```bash
php artisan test
```

## License

This project is licensed under the MIT License.