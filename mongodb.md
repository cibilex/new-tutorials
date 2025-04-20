# MongoDB

- In MongoDB, matchedCount tells you how many documents matched the filter, while modifiedCount tells you how many were actually changed. If the update sets a field to its existing value, matchedCount may be > 0, but modifiedCount will be 0 since no data was changed.