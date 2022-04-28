import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Dimensions, ActivityIndicator} from 'react-native';
import React,{useState,useEffect} from 'react';
import { Fontisto } from '@expo/vector-icons'; 

// 핸드폰의 width와 height를 가져온다
const {width: SCREEN_WIDTH} = Dimensions.get("window");
const API_KEY = "caf4c8e453002c407629c83df8fd1fe3";
const icons = {
  Clouds: 'cloudy',
  Clear: 'day-sunny',
  Rain: 'rain',
  Snow: 'snow',
  Atmosphere: 'fog',
  Drizzle: 'day-rain',
  Thunderstorm: 'lightning',
}
const color = {
  Clouds: '#8d99ae',
  Clear: '#00b4d8',
  Rain: '#023047',
  Snow: '#a2d2ff',
  Atmosphere: '#a5a58d',
  Drizzle: '#023e8a',
  Thunderstorm: '#001219',
}
export default function App() {
  const [city, setCity] = useState("Loading...");
  const [street, setStreet] = useState();
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const getWeather = async() => {
    const {granted} = await Location.requestForegroundPermissionsAsync();
    // background와 차이점은, foreground는 앱 사용 중에만 위치정보를 가져오는 것!
    if(!granted){
      setOk(false);
    }
    const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy:5});
    // reverse 머시기는 위에서 가져온 정보 중 필요한 경도와 위도만 찝어서 보여준다 이런 말 같음.
    const location = await Location.reverseGeocodeAsync({latitude, longitude},{useGoogleMaps:false});
    setCity(location[0].city);
    setStreet(location[0].street);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`);
    const json = await response.json();
    setDays(json.daily);
    // 많은 정보 중에서 daily에 대한 값만 필요하기 때문에 이렇게 지정.
  }
  useEffect(() => {
    getWeather();
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.streetName}>{street}</Text>
      </View>
      {/* 기존처럼 해주려면 style -> contentContainerstyle로 바꿔줘야 한다! */}
      <ScrollView 
      pagingEnabled
      horizontal 
      showsHorizontalScrollIndicator={false}

      contentContainerstyle={styles.weather}>
        {/* 만약 날씨 api에서 가져온 값이 없다면, 로딩창을 보여준다! 아니면 정상적으로 보여주기 */}
        {days.length == 0 ? (
        <View style={styles.day}>
          {/* 로딩창 보여주기 */}
          <ActivityIndicator color="#fff" size="large" style={{marginTop:10,}}/>
        </View>
        ) : (
          days.map((day, index) => 
          <View key = {index} style = {[styles.day, {backgroundColor:color[day.weather[0].main]}]}>
            <View>
              <Text style={styles.when}>
                {new Date(day.dt * 1000).toString().substring(0, 3)}
                {"\n"}
                {new Date(day.dt * 1000).toString().substring(4, 10)}
              </Text>
              {/* weather api에서 dt의 정보를 활용. 단순 숫자지만 뭐 연결고리가 있나보오.. */}
                <Text style={styles.temp}>{parseFloat(day.temp.day).toFixed(1) + "℃"}</Text>
                {/* toFixed(1)은 소수점 한자리 수까지만 가능하다 이말임 */}
                <Text style={styles.describe}>{day.weather[0].main} <Fontisto name={icons[day.weather[0].main]} size={30} color="#fff" /></Text>
            </View>
          </View>)
        )}
      </ScrollView>
      <StatusBar style="light" />
    </View>
  );
}

// 자동완성을 위해 StyleSheet.create를 사용함
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  city: {
    flex:1,
    // 가운데정렬
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  weather: {
    flex:3,
  },
  cityName:{
    paddingTop: 20,
    color: "#fff",
    fontSize: 48,
    fontWeight: "600",
  },
  streetName:{
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  day:{
    margin:30,
    borderRadius: 30,
    width: SCREEN_WIDTH-60,
    height: SCREEN_WIDTH-30,
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temp:{
    fontSize:78,
    fontWeight:"600",
    color: "#fff",
  },
  describe:{
    fontSize:28,
    fontWeight:"600",
    color: "#fff",
  },
  when: {
    marginTop: -20,
    fontSize: 28,
    color:"#fff",
  }
});
