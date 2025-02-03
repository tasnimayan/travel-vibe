<a name="readme-top"></a>

<div align="center">
  <h1 align="center">Travel Vibe - Backend API</h1>
  <p align="center">
    <a href="https://github.com/tasnimayan">View Demo</a>
    ·
    <a href="https://github.com/tasnimayan">Report Bug</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Request Feature</a>
  </p>
</div>

## Overview

The **Travel Vibe** backend API is a robust server-side application built using **Node.js**, **TypeScript**, and **MongoDB** to power a seamless travel experience. This API provides essential features for travel planning, tour organization, local guide and hotel management, and tourism promotion in Bangladesh.

## Features

- **User Authentication**: Secure user authentication using JWT.
- **Tour Plans Management**: Tour organizers can post and manage their travel plans.
- **Local Guide & Hotel Listings**: Local guides and hotels can list their services.
- **Tourism Promotion**: Facilitates tourism by providing relevant travel information.
- **Scalable & Efficient**: Built with best practices in REST API development and optimized for performance.

## Technologies Used

- **Node.js** - Backend runtime environment
- **TypeScript** - Static typing for improved development
- **MongoDB** - NoSQL database for storing user and tour data
- **Express.js** - Web framework for API routing
- **Mongoose** - ODM for MongoDB schema modeling
- **JWT Authentication** - Secure user authentication
- **dotenv** - Manage environment variables

## Installation

### Prerequisites

- Node.js (>=16.x.x)
- MongoDB installed or a cloud database (e.g., MongoDB Atlas)

### Steps

1. Clone the repo
   ```sh
   git clone https://github.com/tasnimayan/travelvibe.git
   ```
2. Install NPM packages

   ```sh
   npm install

   ```

3. Create a `.env` file in the root directory

4. Put these variable in the `.env`
   ```js
   PORT = "Port Number";
   DATABASE = "MongoDB Connection String";
   JWT_SECRET = "Enter Your Secret Key";
   NODE_ENV = "development";
   JWT_COOKIE_EXPIRES_IN = "Cookie expiration time in String (e.g. '90 days')";
   JWT_EXPIRES = "Enter token expiration day in Number (e.g. 30)";
   HOST_MAIL = "Enter Your Host Mail";
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## API Endpoints

<!--
### Auth

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user & get token

### Tours

- `GET /api/tours` - Get all tour plans
- `POST /api/tours` - Create a new tour plan (Authenticated)
- `GET /api/tours/:id` - Get a single tour plan by ID

### Guides & Hotels

- `GET /api/guides` - Get all local guides
- `POST /api/guides` - Add a local guide (Authenticated)
- `GET /api/hotels` - Get all hotels
- `POST /api/hotels` - Add a hotel (Authenticated) -->

## Contribution

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

This project is licensed under the MIT License.

## Contact

Tasnim Ayan - [@Linkedin](https://https://www.linkedin.com//tasnimayan) || [Mail](mailto:tasnimayan22@gmail.com)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
