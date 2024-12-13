# Start from the Bitnami PostgreSQL image
FROM bitnami/postgresql:latest

# Switch to root user to install packages
USER root

# Install necessary packages to build pg_partman and include nano
RUN apt-get update && apt-get install -y \
    postgresql-server-dev-all \
    build-essential \
    curl \
    git \
    nano \
    && apt-get clean

# Download and install pg_partman
RUN curl -L "https://github.com/pgpartman/pg_partman/archive/refs/tags/v4.5.0.tar.gz" --output "pg_partman.tar.gz" \
    && tar -xvf pg_partman.tar.gz \
    && cd pg_partman-4.5.0 && make && make install

# Remove unnecessary files to keep the image small
RUN rm -rf pg_partman-4.5.0 pg_partman.tar.gz

# Switch back to the non-root user provided by Bitnami
USER 1001
