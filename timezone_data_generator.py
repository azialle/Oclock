import json
import os
from timezonefinder import TimezoneFinder
from shapely.geometry import shape

timezone_finder = TimezoneFinder()


def timezone_info(spatial_data):
    country_shape = shape(spatial_data)

    point = country_shape.representative_point()
    longitude, latitude = point.x, point.y

    timezone_name = timezone_finder.timezone_at(lng=longitude, lat=latitude)
    if not timezone_name:
        timezone_name = timezone_finder.certain_timezone_at(lng=longitude, lat=latitude)

    return timezone_name, latitude, longitude


def main():
    source_file = "data/ne_110m_admin_0_countries.geojson"
    output_file = "static/data/countries_data.json"

    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    with open(source_file, "r", encoding="utf-8") as file:
        world_geojson = json.load(file)

    for feature in world_geojson["features"]:
        country_name = feature["properties"].get("ADMIN", "Unknown")

        iana_tz, latitude, longitude = timezone_info(feature["geometry"])

        feature["properties"]["iana_tz"] = iana_tz
        feature["properties"]["latitude"] = latitude
        feature["properties"]["longitude"] = longitude

        print(f"Processed: {country_name}")

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(world_geojson, file)

    print(f"Countries data saved to {output_file}")


if __name__ == "__main__":
    main()
