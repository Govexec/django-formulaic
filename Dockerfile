FROM python:3.9-slim

# Set environment variable to avoid buffering
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
RUN mkdir /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app/

# Install Rust and other required dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    . $HOME/.cargo/env && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Set up NVM environment variables and install Node.js
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 7.10.1
RUN . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm use $NODE_VERSION && nvm alias default $NODE_VERSION

# Ensure Node.js and npm are available in the PATH
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install any needed packages specified in requirements.txt as well as uwsgi
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose the application port
EXPOSE 8000

# Define the default command to run the application (you might need to adjust this based on your specific application)
CMD ["uwsgi", "--ini", "uwsgi.ini"]
