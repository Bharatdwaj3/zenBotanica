# HonKhana

HonKhana is a comprehensive library management system developed using a microservices architecture.

It provides functionalities for managing books, handling book circulation (loans, fines, renewals), and user management.
The system is built with Node.js, TypeScript, Express, React, and PostgreSQL, leveraging Docker for containerization.

## Features 🌟

*   **Microservices Architecture:** The system is divided into independent services for Catalog, Circulation, and Members, allowing for scalability and maintainability.
*   **Book Management:** Allows for adding, updating, deleting, and searching books, including features like featured books and weekly reads.
*   **Circulation Management:** Handles book borrowing, returning, renewals, and fines, with overdue reminders.
*   **User Management:** Manages faculty and student user data, including roles and permissions.
*   **File Uploads:** Supports uploading book covers and PDF documents, with PDF metadata extraction.
*   **Authentication & Authorization:** Implements JWT-based authentication and role-based access control.
*   **Payment Integration:** Integrates with Razorpay for fine payments.
*   **Frontend:** A modern React-based frontend with a focus on user experience and a clean UI.
*   **Dockerization:** The entire application is containerized using Docker Compose for easy setup and deployment.
*   **Observability:** Includes configurations for Loki, Prometheus, and Grafana for monitoring.

## Tech Stack 💻

*   **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL, Firebase Admin SDK, JWT, bcryptjs, Nodemon, Multer, PDF-Parse, node-cron, nodemailer, Razorpay
*   **Frontend:** React, Redux Toolkit, React Router DOM, Axios, Vite, Tailwind CSS, MUI (Material UI), Emotion, TipTap, Framer Motion, Lucide React
*   **Database:** PostgreSQL
*   **Containerization:** Docker, Docker Compose
*   **CI/CD:** Not explicitly configured in the provided snippets.
*   **Observability:** Loki, Prometheus, Grafana (indicated by K8s configurations).

## Project Structure 📁

The project follows a microservices pattern with distinct directories for each service:

*   `catalog/`: Manages book information, including APIs for books, cart, wishlist, and file storage.
*   `circulation/`: Handles book loans, fines, and overdue reminders.
*   `firebase/`: Contains configurations for Firebase emulators (auth, storage).
*   `frontend/`: The React-based user interface.
*   `k8s/`: Kubernetes configuration files for deployment and observability.
*   `members/`: Manages user authentication, profiles, and roles.

## Installation 🚀

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Bharatdwaj3/HonKhana.git
    cd HonKhana
    ```

2.  **Set up environment variables:**
    Create `.env` files in the `catalog`, `circulation`, and `members` directories based on the `.env.example` files provided.
    Ensure you configure `DATABASE_URL`, `JWT_ACC_SECRECT`, `INTERNAL_SERVICE_SECRET`, and other necessary variables.

3.  **Install dependencies:**
    Navigate to each service directory (`catalog`, `circulation`, `members`, `frontend`) and run:
    ```bash
    npm install
    ```

4.  **Set up Prisma schema and generate clients:**
    Run the following command in the root of each backend service (`catalog`, `circulation`, `members`):
    ```bash
    npx prisma generate
    npx prisma migrate deploy
    ```
    This will set up your database schema and generate Prisma client code.

5.  **Run Docker Compose:**
    This will start all the necessary services (databases, backend microservices, frontend, mailhog).
    ```bash
    docker-compose up -d
    ```

6.  **Seed the databases (Optional but Recommended):**
    For `catalog` and `members` services, you can seed the database with initial data:
    ```bash
    cd catalog && npm run seed && cd ..
    cd members && npm run seed && cd ..
    ```
    The `circulation` service's seed script is intended for testing and might create duplicate entries if run more than once.

7.  **Start the frontend development server:**
    ```bash
    cd frontend
    npm run dev
    ```

## Usage 📚

This project is a multi-service library management system. Here's how the core services interact:

1.  **Members Service (`members/`):**
    *   Handles user registration, login, profile management, and role management.
    *   Provides internal APIs for other services to look up user details by ID or email.
    *   Uses JWT for authentication and refresh tokens for session management.

2.  **Catalog Service (`catalog/`):**
    *   Manages the book inventory, including details, copies, and storage.
    *   Handles user cart and wishlist functionalities.
    *   Provides APIs for file uploads (covers, PDFs) and PDF metadata extraction.
    *   Integrates with the Circulation service to check book availability and trending status.

3.  **Circulation Service (`circulation/`):**
    *   Manages book borrowing, returning, renewals, and fines.
    *   Handles fine payments via Razorpay integration.
    *   Features an automated daily cron job (`reminder.job.ts`) to send email reminders for overdue or due-soon books via Mailhog.
    *   Includes internal APIs for the Catalog service to attempt borrowing and retrieve loan counts.

4.  **Frontend (`frontend/`):**
    *   A React application built with Vite, Tailwind CSS, and Material UI.
    *   Provides a user interface for browsing books, managing loans, viewing fines, and interacting with the system.
    *   Features include a book search, category filtering, sorting, user profiles, cart, wishlist, and admin dashboards.
    *   Utilizes Redux Toolkit for state management.

### Key Entry Points:

*   **Catalog Service:** `catalog/server.ts` (Port 4001)
*   **Circulation Service:** `circulation/server.ts` (Port 4002)
*   **Members Service:** `members/server.ts` (Port 4003)
*   **Frontend:** Starts via `npm run dev` in the `frontend/` directory, typically served on Port 5173 (though Docker Compose maps it to 80).

### Real-World Use Cases:

*   **Student/Faculty Borrowing:** Users can browse the catalog, add books to their cart, and borrow them. The system enforces loan limits and checks for overdue fines.
*   **Digital Reading:** Users can read PDF versions of books directly within the application.
*   **Fine Management:** Fines for overdue or damaged books are automatically calculated and can be paid online via Razorpay.
*   **Admin Operations:** Admins can manage the book catalog, view all loans, issue new loans, and waive fines.
*   **Notifications:** Automated email reminders are sent for upcoming due dates and overdue books.



## Important Links 🔗

*   [Live Demo (if available)](): Not provided in repository details.
*   [Author Profile](https://github.com/Bharatdwaj3) (linked from repository URL)
