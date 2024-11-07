import os
from locust import HttpUser, constant_throughput, task

protocol = os.getenv("protocol", "https")
host = os.getenv("domain", "example.com")
base_url = f"{protocol}://{host}"


class WebsiteUser(HttpUser):
    host = base_url
    wait_time = constant_throughput(1)

    @task
    def mainPage(self):
        self.client.get("/", name="Homepage")
