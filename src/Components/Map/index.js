import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import ProfileCard from '../ProfileCard';

// const virginia_data = require('../../data/loan_data_TEST');

const containerStyle = {
    width: '90vw',
    height: '60vh',
    alignSelf: 'center',
    margin: '0 auto'
};

const center = {
    lng: -77.4360,
    lat: 37.5407
};

function MapComponent(props) {

    const { minorChecked, moderateChecked, seriousChecked, criticalChecked } = props;

    const [locations, setLocations] = useState([]);

    const fetchLocations = async () => {
        try {
            const response = await fetch('https://villagr.herokuapp.com/api/VA?page=1&limit=1500')
            const data = await response.json();
            // console.log(data.data);
            setLocations(data.data);
        } catch(error) {
            console.error(error);
        }
    }


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY
    });

    const [map, setMap] = React.useState(null)
    const [ selected, setSelected ] = React.useState(null);

    // console.log(map);
    const onSelect = item => {
        setSelected(item);
    }
    const onLoad = React.useCallback(function callback(map) {
        // const bounds = new window.google.maps.LatLngBounds();
        // map.fitBounds(bounds);
        setMap(map)
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    useEffect(() => {
        fetchLocations();
    }, []);

    const minorIcon = {
        // url: '../../icons/Minor_Need.png',
        url: 'https://res.cloudinary.com/bitingrent/image/upload/v1616616185/service-one/Minor_Need_m0lnc5.png',
        scaledSize: { width: 20, height: 25 }
    }
    const moderateIcon = {
        // url: '../../icons/Moderate_Need.png',
        url: 'https://res.cloudinary.com/bitingrent/image/upload/v1616616185/service-one/Moderate_Need_lhwil8.png',
        scaledSize: { width: 20, height: 25 }
    }
    const seriousIcon = {
        // url: '../../icons/Serious_Need.png',
        url: 'https://res.cloudinary.com/bitingrent/image/upload/v1616616185/service-one/Serious_Need_kzcveb.png',
        scaledSize: { width: 20, height: 25 }
    }
    const criticalIcon = {
        // url: '../../icons/Critical_Need.png',
        url: 'https://res.cloudinary.com/bitingrent/image/upload/v1616616185/service-one/Critical_Need_csmdmo.png',
        scaledSize: { width: 20, height: 25 }
    }

    // console.log(locations);

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            { 
                locations ?
                (
                    locations.map((item, index) => {
                        let iconChoice = minorIcon;
                        if (item.loan_size_rank_by_state < 0.25) {
                            iconChoice = minorIcon;
                        } else if (item.loan_size_rank_by_state >= 0.25 && item.loan_size_rank_by_state < 0.50) {
                            iconChoice = moderateIcon;
                        } else if (item.loan_size_rank_by_state >= 0.50 && item.loan_size_rank_by_state < 0.75) {
                            iconChoice = seriousIcon;
                        } else if (item.loan_size_rank_by_state >= 0.75) {
                            iconChoice = criticalIcon
                        }
                        return (
                            ((iconChoice === minorIcon && minorChecked) || 
                            (iconChoice === moderateIcon && moderateChecked) || 
                            (iconChoice === seriousIcon && seriousChecked) || 
                            (iconChoice === criticalIcon && criticalChecked))
                        ?
                        (
                            <Marker 
                                key={index} 
                                position={{lat: item.lat_long[0], lng: item.lat_long[1]}}
                                icon={iconChoice} 
                                onClick={() => onSelect(item)} //item in the array of data
                            />
                        ) : <></>)
                    })
                ) : <></>
            }
            {
            selected ? (
                <InfoWindow
                    position={{lat: selected.lat_long[0], lng: selected.lat_long[1]}}
                    clickable={true}
                    onCloseClick={() => setSelected(null)}
                >
                    <div>
                        <ProfileCard
                            business_name={selected.business_name}
                            street_address={selected.street_address}
                            city={selected.city}
                            state={selected.state}
                            zip_code_first5={selected.zip_code_first5}
                            lat_long={selected.lat_long}
                            loan_size_rank_by_state={selected.loan_size_rank_by_state}
                        />
                    </div>
                </InfoWindow>
                ) : <></>
            }

        </GoogleMap>
    ) : <p>Loading...</p>
}

export default React.memo(MapComponent);
