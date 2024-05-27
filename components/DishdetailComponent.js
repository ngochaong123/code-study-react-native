import React, { Component } from "react";
import { View, Text, FlatList, Button,Modal,SafeAreaView  } from "react-native";
import { Card, Image, Rating, Icon ,Input} from "react-native-elements";
import { ScrollView } from 'react-native-virtualized-view';
import { baseUrl } from '../shared/baseUrl';
import { connect } from 'react-redux';
import { postFavorite ,postComment } from '../redux/ActionCreators';

class ModalContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 3,
      author: '',
      comment: ''
    };
  }
  render() {
    return (
      <SafeAreaView>
        <View style={{ justifyContent: 'center', margin: 20 }}>
          <Rating startingValue={this.state.rating} showRating={true}
            onFinishRating={(value) => this.setState({ rating: value })} />
          <View style={{ height: 20 }} />
          <Input value={this.state.author} placeholder='Author' leftIcon={{ name: 'user-o', type: 'font-awesome' }}
            onChangeText={(text) => this.setState({ author: text })} />
          <Input value={this.state.comment} placeholder='Comment' leftIcon={{ name: 'comment-o', type: 'font-awesome' }}
            onChangeText={(text) => this.setState({ comment: text })} />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Button title='SUBMIT' color='#7cc'
              onPress={() => this.handleSubmit()} />
            <View style={{ width: 10 }} />
            <Button title='CANCEL' color='#7cc'
              onPress={() => this.props.onPressCancel()} />
          </View>
        </View>
      </SafeAreaView>

    );
  }
  handleSubmit() {
    this.props.postComment(this.props.dishId, this.state.rating, this.state.author, this.state.comment);
    this.props.onPressCancel();
  }
}

class RenderComments extends Component {
  render() {
    const comments = this.props.comments;
    return (
      <Card>
        <Card.Title>Comments</Card.Title>
        <Card.Divider />
        <FlatList data={comments}
          renderItem={({ item, index }) => this.renderCommentItem(item, index)}
          keyExtractor={(item) => item.id.toString()} />
      </Card>
    );
  }
  renderCommentItem(item, index) {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        {/* <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text> */}
        <Rating startingValue={item.rating} imageSize={16} readonly style={{ flexDirection: 'row' }} />
        <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + item.date} </Text>
      </View>
    );
  };
}

class RenderDish extends Component {
  render() {
    const dish = this.props.dish;
    if (dish != null) {
      return (
        <Card>
         <Image source={{ uri: baseUrl + dish.image }}
            style={{
              width: "100%",
              height: 100,
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Card.FeaturedTitle>{dish.name}</Card.FeaturedTitle>
          </Image>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Icon raised reverse name={this.props.favorite ? 'heart' : 'heart-o'} type='font-awesome' color='#f50'
              onPress={() => this.props.favorite ? alert('Already favorite') : this.props.onPressFavorite()} />
            <Icon raised reverse name='pencil' type='font-awesome' color='#f50'
              onPress={() => this.props.onPressComment()} />
          </View>
        </Card>
      );
    }
    return <View />;
  }
}

// redux

const mapStateToProps = (state) => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  }
};

const mapDispatchToProps = (dispatch) => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
});

class Dishdetail extends Component {
    constructor(props) {
      super(props);
      /*this.state = {
        // dishes: DISHES,
        // comments: COMMENTS,
        favorites: []
      };*/
      this.state = {
        showModal: false
      };
    }
    render() {
      const dishId = parseInt(this.props.route.params.dishId);
      const dish = this.props.dishes.dishes[dishId];
      const comments = this.props.comments.comments.filter((cmt) => cmt.dishId === dishId);
      const favorite = this.props.favorites.some((el) => el === dishId);
      return (
        <ScrollView>
          <RenderDish dish={dish} favorite={favorite} onPressFavorite={() => this.markFavorite(dishId)} onPressComment={() => this.setState({ showModal: true })} />
          <RenderComments comments={comments} />
          <Modal animationType={'slide'} visible={this.state.showModal}
          onRequestClose={() => this.setState({ showModal: false })}>
          <ModalContent dishId={dishId}
            onPressCancel={() => this.setState({ showModal: false })} postComment={this.props.postComment} />
        </Modal>
        </ScrollView>
      );
    }
    markFavorite(dishId) {
      this.props.postFavorite(dishId);
    }
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);