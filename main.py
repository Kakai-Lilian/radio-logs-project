from datetime import datetime
import requests

okay = True
stations = "The following streams are not working:\n"
# Error message mapping
error_messages = {
    requests.ConnectionError: "Could not connect to the server.",
    requests.Timeout: "The request timed out.",
    requests.RequestException: "An unknown error occurred."
}

radios = {
    "radio_taifa\t":     "https://stream-13.zeno.fm/ud2u96xst5quv",
    "english_service\t": "https://stream-48.zeno.fm/mhmwnyyst5quv",
    "pwani_fm\t":        "https://stream-22.zeno.fm/smhmfr1a94zuv",
    "coro_fm\t":         "https://stream-38.zeno.fm/65sw1gyst5quv",
    "iftin\t":           "https://stream-10.zeno.fm/1v7yr8499yzuv",
    "mayienga\t":        "https://stream-69.zeno.fm/ayw9hk0st5quv",
    "minto\t":           "https://stream-61.zeno.fm/u3dw22zst5quv",
    "kitwek_fm\t":       "https://stream-23.zeno.fm/gh67mvp8f2zuv",
    "mwatu_fm":          "https://stream-26.zeno.fm/kawduafexa0uv",
    "ingo_fm\t":         "https://stream-37.zeno.fm/sxr6fxkgymzuv",
    "mwago_fm\t":        "https://stream.zeno.fm/3bp7c3sfx98uv",
    "nosim_fm\t":        "https://stream-23.zeno.fm/nw5wm356998uv",
    "ngemi_fm\t":        "https://stream-160.zeno.fm/bq8gnvsso0xuv?zs",
}

testData = 0
while testData <= 10:
    okay = True
    stations = "The following streams are not working:\n"
    print("\nKBC RADIOS STREAMING STATUS\n")
    print("Station Name\tStatus Code\tStream Link")
    print("----------------------------------------------")
    for r in radios:
        try:
            with requests.get(radios[r], stream=True) as l:
                print(f"{r}\t{l.status_code}\t\t{l.url}")
                if l.status_code != 200:  # Check if the status code is not 200
                    okay = False
                   #  stations += f"{r}\n"  # Add the station name to the list of failed stations
        except requests.RequestException as e:
            # Translate error to human-readable text
            print(e)
            error_message = next(
                (message for exc_type, message in error_messages.items()
                 if isinstance(e, exc_type)),
                "An unexpected error occurred."
            )
            print(f"Error for {r}: {error_message}")
            okay = False
            stations += f"{r}: {error_message}\n"

    print("\nOperation Complete!\n\n")

    if (okay):
        message = "All streams are working well."
    else:
        message = stations
    # only send a message if one or more stations are down
    if (okay == False):
       # URL of the API endpoint
        url = "http://172.16.1.5:3002/send-message"

        # Data to send in the POST request (JSON format)
        data = {

            "groupId": "",
            "numbers": [""],
            "message": message
        }

        # Headers (optional, depends on the API requirements)
        headers = {
            "Content-Type": "application/json",  # Specify content type
            # "Authorization": "Bearer your_token"  # Example if an API token is required
        }

        # Perform the POST request
        response = requests.post(url, json=data, headers=headers)

        # Check the response
        if response.status_code == 200:  # Success
            print("Request succeeded!")
            # Assuming the response is JSON
            print("Response:", response.json())
        else:
            print(f"Request failed with status code {response.status_code}")
            print("Response:", response.text)
    else:
        print("All Streams are live")
