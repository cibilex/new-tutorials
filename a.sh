#!/bin/bash

# Set variables for database connection
PGUSER=postgres
PGDATABASE=postgres

# Set the path where you want to store the backup files
BACKUP_DIR=/opt  # Assuming /opt is the intended directory


# Get current date and time
datestamp=$(date +'%Y-%m-%d')
timestamp=$(date +'%H_%M')  # Removed ":" for safe file naming

# Set the backup file name
BACKUP_FILE="$BACKUP_DIR/${PGDATABASE}_${datestamp}_${timestamp}.tar"

# Execute the pg_dump command to dump the database in tar format
pg_dump -U "$PGUSER" -d "$PGDATABASE" -F t > "$BACKUP_FILE"

# Check if the pg_dump command was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
else
    echo "Backup failed!" >&2
    exit 1
fi
