#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║   منصة رَسَن - Rasan Platform         ║"
echo "║   Setup Script - البدء السريع          ║"
echo "╚════════════════════════════════════════╝"

echo "1. Installing Frontend Dependencies..."
cd frontend && npm install

echo "2. Installing Backend Dependencies..."
cd ../backend && npm install

echo "3. Setting up Environment Variables..."
cp .env.example .env
cd ../frontend && cp .env.example .env

echo "4. Database Setup Reminder..."
echo "Please make sure your MySQL server is running and run: mysql -u root -p < ../database/schema.sql"
echo "To load sample data: mysql -u root -p < ../database/seed.sql"

echo "Setup Complete! You can now run ./start.sh"
