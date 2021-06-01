FROM python:3
ENV PYTHONUNBUFFERED 1
RUN mkdir /app
COPY . /app/
WORKDIR /app

# Install any needed packages specified in requirements.txt as well as uwsgi
RUN pip install -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000
