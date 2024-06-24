import React, { Component } from "react";
import { StyleSheet, View, ScrollView, Text, Switch, Button, Modal, Alert } from "react-native";
import { Icon } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import * as Animatable from 'react-native-animatable';
import * as Notifications from 'expo-notifications';
import * as Calendar from 'expo-calendar';

class ModalContent extends Component {
  render() {
    return (
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>Your Reservation</Text>
        <Text style={styles.modalText}>
          Number of Guests: {this.props.guests}
        </Text>
        <Text style={styles.modalText}>
          Smoking?: {this.props.smoking ? "Yes" : "No"}
        </Text>
        <Text style={styles.modalText}>
          Date and Time: {format(this.props.date, "dd/MM/yyyy - HH:mm")}
        </Text>
        <Button
          title="Close"
          color="#7cc"
          onPress={() => this.props.onPressClose()}
        />
      </View>
    );
  }
}

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guests: 1,
      smoking: false,
      date: new Date(),
      showDatePicker: false,
      showModal: false,
    };
  }
  ResetForm()
  {
    this.setState({ guests: 0, smoking: false, date: new Date() })
  }
  AlertOnReservation()
  {
    Alert.alert("Your Reservation OK?", "Number of guests: " + this.state.guests + "\nSmoking? " + this.state.smoking + 
    "\nDate and Time: " + this.state.date, 
    [
      {"text": "CANCEL", onPress: () => this.ResetForm()},
      {"text": "OK", onPress: () => { this.handleReservation() }}
    ], {cancelable: true})
  }
  render() {
    return (
      <ScrollView>
        <Animatable.View animation="zoomIn" duration={2000} delay={1000}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Number of Guests</Text>
            <Picker
              style={styles.formItem}
              selectedValue={this.state.guests}
              onValueChange={(value) => this.setState({ guests: value })}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
            </Picker>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Smoking/No-Smoking?</Text>
            <Switch
              style={styles.formItem}
              value={this.state.smoking}
              onValueChange={(value) => this.setState({ smoking: value })}
            />
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Date and Time</Text>
            <Icon
              name="schedule"
              size={36}
              onPress={() => this.setState({ showDatePicker: true })}
            />
            <Text style={{ marginLeft: 10 }}>
              {format(this.state.date, "dd/MM/yyyy - HH:mm")}
            </Text>
            <DateTimePickerModal
              mode="datetime"
              isVisible={this.state.showDatePicker}
              onConfirm={(date) =>
                this.setState({ date: date, showDatePicker: false })
              }
              onCancel={() => this.setState({ showDatePicker: false })}
            />
          </View>
          <View style={styles.formRow}>
            <Button
              title="Reserve"
              color="#7cc"
              onPress={() => this.AlertOnReservation()}
            />
          </View>
        </Animatable.View>
        <Modal
          animationType={"slide"}
          visible={this.state.showModal}
          onRequestClose={() => this.setState({ showModal: false })}
        >
          <ModalContent
            guests={this.state.guests}
            smoking={this.state.smoking}
            date={this.state.date}
            onPressClose={() => this.setState({ showModal: false })}
          />
        </Modal>
      </ScrollView>
    );
  }
  handleReservation() {
    // alert(JSON.stringify(this.state));
    //this.setState({ showModal: true });
    this.presentLocalNotification(this.state.date);
    this.addReservationToCalendar(this.state.date);
    this.ResetForm();
  }
  async presentLocalNotification(date) {
    //console.log("Hello from Notification")
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }),
        //handleNotification: async (notification) => ({
          
        //})
      });
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Your Reservation',
          body: 'Reservation for ' + date + ' requested',
          sound: true,
          vibrate: true
        },
        trigger: null
      }).then((a) => console.log(a)).catch((err) => console.log(err));
    }
  }

  async obtainCalendarPermission()
  {
    const result = await Calendar.requestCalendarPermissionsAsync();
    // if (result.granted)
    //   {
    //     console.log("Granted calendar permission");
    //     console.log("yo");
    //     //const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    //     //console.log(calendars);
    //   }
  }

  async addReservationToCalendar(date)
  {
    try
    {
        await this.obtainCalendarPermission();
        var calendars = await Calendar.getCalendarsAsync();
        var defaultCalendar = calendars.filter((c) => c.source.isLocalAccount == true);
        console.log("default calendar:", defaultCalendar)
        //console.log("Calendar length:", calendars.length);
        // console.log("Calendar[1] id: ", calendars[1]) // id là 2 => Nếu để id là 2 thì sẽ post event vào account chanhien55@gmail.com
        // console.log("Calendar[0] id: ", calendars[0]) // id là 1 => Nếu để id là 1 thì sẽ post event vào local account
        // console.log("Calendar[n]: ", calendars[calendars.length-1]);
        // console.log("List of calendars: ", calendars);
        //console.log(calendars);
        // console.log(calendars[1].source.name);
        // console.log(calendars[2].source.name)
        //Tại sao calendars.length trả về số nhỏ nhưng có calendarId cao?
        //Đã làm được, createEventAsync nhận vào thông số đầu tiên là string chứ ko phải int,
        //Tuy nhiên, calendars ở dòng 173 đại diện cho cái gì? Và tại sao có 4 account logged in nhưng có tới
        //một đống calendars.
        //Nếu calendars hiển thị event thì nó nên là getEventAsync chứ
        //và tại sao calendars1, calendars2 đều chỉ đến chanhien55@gmail.com? Vậy calendar đâu phải đại diện cho một account calendar
        //phải add local account? vào Google tức là event chỉ được add vào local account chứ không phải chanhien55@gmail.com
        //console.log(calendarId);

        var result = await Calendar.createEventAsync(defaultCalendar[0].id, {
          title: "Confusion Table Reservation",
          startDate: date,
          endDate: new Date(Date.parse(date) + 2 * 60 * 60 * 1000),
          timeZone: "Asia/Hong_Kong",
          location: "121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong.",
        })

        // iOS, ko biết có hoạt động ko nhưng getDefaultCalendarAsync chỉ sử dụng được cho iOS.
        // var result = await Calendar.createEventAsync((await Calendar.getDefaultCalendarAsync()).id.toString(), {
        //   title: "Confusion Table Reservation",
        //   startDate: date,
        //   endDate: new Date(Date.parse(date) + 2 * 60 * 60 * 1000),
        //   timeZone: "Asia/Hong_Kong",
        //   location: "121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong.",
        // })

        // console.log(result);
        // console.log(await Calendar.getEventsAsync(["1"]))
        //console.log(result);
    }
    catch(err)
    {
      console.log(err)
    }
  }
}
export default Reservation;

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20,
  },
  formLabel: { fontSize: 18, flex: 2 },
  formItem: { flex: 1 },
  modal: { justifyContent: "center", margin: 20, marginTop: 100 },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#7cc",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  modalText: { fontSize: 18, margin: 10 },
});
