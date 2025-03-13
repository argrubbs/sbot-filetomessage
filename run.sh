#!/bin/bash

# Check for OS type and use the correct package manager
if [ "$(uname)" == "Darwin" ]; then
  packageManager="brew"
elif [ "$(uname)" == "Linux" ]; then
  case "$(command -v apt dnf zypper pacman 2>/dev/null | head -n1)" in
    *apt*)     packageManager="apt" ;;
    *dnf*)     packageManager="dnf" ;;
    *zypper*)  packageManager="zypper" ;;
    *pacman*)  packageManager="pacman" ;;
    *)         echo "No supported package manager found"; exit 1 ;;
  esac
fi

# Function to install packages based on the package manager
install_packages() {
  # $@ passes all arguments to the install command
  case "$packageManager" in
    "apt")     apt install -y "$@" ;;
    "dnf")     dnf install -y "$@" ;;
    "zypper")  zypper install -y "$@" ;;
    "pacman")  pacman -S --noconfirm "$@" ;;
  esac
}

# Check for node and install if not found
if ! command -v node &> /dev/null; then
  echo "node is not installed. Installing..."
  install_packages nodejs npm
  if [ $? -ne 0 ]; then
    echo "node installation failed."
    exit 1
  fi
fi

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
  echo "pnpm is not installed. Installing..."
  npm install -g pnpm
  if [ $? -ne 0 ]; then
    echo "pnpm installation failed."
    exit 1
  fi
fi


# Install dependencies
echo "Installing dependencies..."
pnpm install
if [ $? -ne 0 ]; then
  echo "Dependency installation failed."
  exit 1
fi

# Run the project
echo "Running the Node script via ts-node..."
pnpm start
if [ $? -ne 0 ]; then
  echo "Project execution failed."
  exit 1
fi

echo "Project finished."