.PHONY: help dev build mock clean install

help:
	@echo "Available commands:"
	@echo "  install  - Install dependencies"
	@echo "  mock     - Start mock server"
	@echo "  dev      - Start development server with mock"
	@echo "  build    - Build for production"
	@echo "  clean    - Clean build files and node_modules"

install:
	npm install

mock:
	@echo "Starting mock server..."
	node src/infrastructure/mock/server.js &
	@echo "Mock server started on http://localhost:3001"

dev: mock
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building for production..."
	npm run build

clean:
	rm -rf dist node_modules package-lock.json
	@echo "Cleaned build files and dependencies"