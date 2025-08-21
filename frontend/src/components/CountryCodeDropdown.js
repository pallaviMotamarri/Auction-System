import React from 'react';

const countryCodes = [
  { code: '+1', name: 'United States' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+91', name: 'India' },
  { code: '+61', name: 'Australia' },
  { code: '+81', name: 'Japan' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+86', name: 'China' },
  { code: '+971', name: 'UAE' },
  // Add more as needed
];

const CountryCodeDropdown = ({ value, onChange }) => (
  <select value={value} onChange={onChange} className="country-code-dropdown">
    {countryCodes.map((country) => (
      <option key={country.code} value={country.code}>
        {country.name} ({country.code})
      </option>
    ))}
  </select>
);

export default CountryCodeDropdown;
