"""
Celery configuration file.  This module defines the broker and backend
URLs for Celery.  Import this module in your tasks or pass its path
when creating the Celery app.  You can override these values via
environment variables.

Example usage in tasks.py:

    from celery import Celery
    import celeryconfig

    app = Celery('podcast_tasks')
    app.config_from_object(celeryconfig)

    @app.task
    def my_task(...):
        ...
"""

import os

broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

# Optional: configure task serialization
task_serializer = "json"
result_serializer = "json"
accept_content = ["json"]
timezone = "UTC"
enable_utc = True