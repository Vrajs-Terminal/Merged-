# How the Login System Works (Authentication Guide)

Now that the backend and database are fully connected, the days of "logging in with any random email and password" are over. The system is now 100% secure.

Here is a simple explanation of how it works right now, and how it will work in the future.

---

### 1. Can I log in with *any* ID and password now?
**NO.** 
The login page (`Login.tsx`) now directly asks the live MySQL database: *"Does this email exist, and does the password match exactly what is saved?"*
If you type a random email or wrong password, it will give you an **"Invalid Credentials"** error and block you.

### 2. Is there a specific password in the database right now?
**YES.**
To help you test the system without having an "Add Employee" screen built yet, we added a small developer tool to the Login page. 

At the very bottom of the Login screen, there is tiny grey text that says:
`"(Dev Tools) Create Default Admin Account"`

**If you click that text, the system instantly creates this account in your database:**
* **Email:** `admin@minehr.com`
* **Password:** `admin`

You can use those exact credentials to log in!

### 3. How do we create new ID/Passwords for new users?
Right now, the only way to create an account is by using that Dev Tools button to create the Admin, or by manually typing data straight into MySQL.

**How it will work tomorrow (when we build the Employees Module):**
1. You (logging in as the Admin) will open the **Employees** page.
2. You will click **"Add New Employee"**.
3. You will enter their Name, Email, Role (Admin or Employee), and assign their Branch/Department.
4. The system will automatically generate a secure password (e.g., `minehr123`) or let you type a custom one.
5. The system will save this to the Database safely (scrambling the password so hackers can't see it).
6. That specific employee can now log in using the email and password you created for them.



* * *           # # #           * * *

I have created a simple, clean guide file for you in your main project folder called 

LOGIN_GUIDE.md
 to explain exactly how this works!

Here is the straightforward breakdown of your questions:

1. Can I log in with any ID and password now?
No. Since we successfully connected to your real database, the system is now 100% secure. When you try to log in, the backend checks the Live MySQL Database to see: "Does this exact email exist, and does the password match?"

If you type a random or incorrect email/password, it will block you and show an "Invalid Credentials" error.

2. Is there a specific password in the database right now?
Yes. Because we haven't built the "Employees" page yet, I built a temporary "Dev Tools" link onto the Login screen so you can test the system.

If you look at the very bottom of the Login page, there is tiny grey text that says: "(Dev Tools) Create Default Admin Account"

If you click that link, it will instantly generate your first Admin account in the database:

Email: admin@minehr.com
Password: admin
You can use those credentials to log into the Dashboard right now!

3. How do we create new IDs and Passwords for new users?
Right now, the only way to create an account is by clicking that Dev Tools button to create the Admin, or by adding it directly into the MySQL database code yourself.

How it will work as soon as we build the Employees Module (our next step):

You (as the Admin) will open the Employees page.
You will click "Add New Employee".
You will enter their Name, Email, Role (Admin or Employee), and assign their Branch/Department.
The system will automatically generate a secure password (for example, minehr123) or let you type a custom one.
The system saves this safely to the Database (scrambling the password so hackers can't intercept it).
That specific employee can now log in using the email and password you just created for them.
Check the 

LOGIN_GUIDE.md
 file in your main folder if you ever need to reference this later!