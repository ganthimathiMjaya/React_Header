import axios from 'axios';
import { env } from 'process';
import { Address } from '@prisma/client';

export async function geocode(address: string) {
  const response = await axios(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {
	address,
	key: env.GOOGLE_MAPS_API_KEY,
      },
    }
  );

  return response;
}

export async function generateGeoLocation(address: Address) {
  let geocoding = [];

  if (
    address.line1 &&
    address.city &&
    address.state &&
    address.zipcode
  ) {
    const addressString = `${address.line1} ${address.city}, ${address.state} ${address.zipcode}`;
    const data = (await geocode(addressString)).data;

    let results = [];
    if (data.status === 'OK') {
      results = data.results;
    }

    if (results.length > 0) {
      geocoding.push(results[0].geometry.location);
    }
  }
  return geocoding;
}
