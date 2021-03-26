import React, { Component } from 'react';
import { Animated, Dimensions, Platform, SafeAreaView, StyleSheet } from 'react-native';

import AppManager from '../../../../manager/appManager';

import Layout1 from './layout-1';
import Colors from '../../../../constant/Colors';
import Styles from '../../../../constant/Styles';
import DateTime from '../../../../constant/DateTime';
import ApiRequest from '../../../../helper/ApiRequest';

import CommentHelper from '../../../../component-helper/commentHelper';

export default class Detail extends Component
{
  _manager = null;

  // MARK: - Component comments
  _commentHelper = null;
  _pageName = 'detail';

  constructor(props)
  {
    console.log('Detail()');
    super(props);

    // Fetch page data and setup comments component
    this._manager = AppManager.GetInstance();
    const page = this._manager.getPage(this._pageName);
    const components = [...page.components];
    for(let i = 0; i < components.length; i++)
    {
      if(components[i].type === 'comments')
      {
        // MARK: - Component comments
        this._commentHelper = CommentHelper.GetInstance(components[i]);
        break;
      }
    }

    this.state =
    {
      isLoading: false,
      id: props.route.params?.id ?? null,
      detail: null,
      customDetails: null,
      commentText: '',
      activeCellIdx: -1,
      activeCellId: '',
      components: components
    };
  }

  loadData = async () =>
  {
    console.log('Detail.loadData()');
    this.setState({ isLoading: true });

    try
    {
      let params = {  id: this.state.id };
      let response = await ApiRequest.sendRequest("post", params, "detail/get");
      //console.log(response.data);
      if(response.data.error === null)
      {
        // MARK: - Component comments
        // Setup animations
        const components = [...this.state.components];
        let commentsComponent = null;
        for(let i = 0; i < components.length; i++)
        {
          if(components[i].type === 'comments')
          {
            commentsComponent = components[i];
            break;
          }
        }

        for(let i = 0; i < response.data.customDetails.comments.length; i++)
        {
          let subCommentFieldAnimation = new Animated.Value(0);
          if(commentsComponent.nestedComments)
          {
            // Setup animation for all children as well
            // TODO: Make a class to represent the comment and nest the animation inside of it so the parent controller
            // doesn't need to do all this
            // Itereate top nodes
            const parentNode = response.data.customDetails.comments[i][1]
            subCommentFieldAnimation = new Animated.Value(0);
            parentNode.comment.animationStyle = subCommentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.05)]});
            parentNode.comment.animation = subCommentFieldAnimation;

            // Iterate children and their children
            // array of array of children
            const childrenToProcess = [];
            if(parentNode.children.length > 0)
            {
              childrenToProcess.push(parentNode.children);
            }
            while(childrenToProcess.length > 0)
            {
              // Handle current node
              const children = childrenToProcess[0];
              subCommentFieldAnimation = new Animated.Value(0);
              children[0].comment.animation = subCommentFieldAnimation;
              children[0].comment.animationStyle =  subCommentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.05)]});

              // Now process it's children
              for(let j = 0; j < children[0].children.length; j++)
              {
                subCommentFieldAnimation = new Animated.Value(0);
                children[0].children[j].comment.animationStyle = subCommentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.05)]});
                children[0].children[j].comment.animation = subCommentFieldAnimation;
                if(children[0].children[j].children.length > 0)
                {
                  childrenToProcess.push(children[0].children[j].children);
                }
              }

              // Pop off the immediate node now
              childrenToProcess.splice(0,1);
            }

          }
          else
          {
            let subCommentFieldAnimation = new Animated.Value(0);
            response.data.customDetails.comments[i].animationStyle = subCommentFieldInterpolate;
            response.data.customDetails.comments[i].animation = subCommentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.05)]});;
          }
        }

        this.setState({ isLoading: false, detail: response.data.results, customDetails: response.data.customDetails });
        return
      }

      this.setState({ isLoading: false  });
      this.props.showAlert('Error', response.data.error.toString());
    }
    catch(err)
    {
      this.setState({ isLoading: false  });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 7 ' + err.message, 'danger');
    }
  }

  performAction = async(params) =>
  {
    console.log('Detail.performAction()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", params, "detail/perform-action");
      console.log(response.data);
      if(response.data.error === null)
      {
        const components = [...this.state.components];
        let commentsComponent = null;
        for(let i = 0; i < components.length; i++)
        {
          if(components[i].type === 'comments')
          {
            commentsComponent = components[i];
            break;
          }
        }

        const newCustomDetails = {...this.state.customDetails};
        for(let i = 0; i < response.data.results.length; i++)
        {
          // MARK: - Component comments
          // TODO: Move this into component helper so we can call one method to handle a specific components logic
          if(response.data.results[i].field === 'comments')
          {
            if(Array.isArray(response.data.results.value))
            {
              for(let j = 0; j < response.data.results.value.length; j++)
              {
                const subCommentFieldAnimation = new Animated.Value(0);
                response.data.results[i].value[j].animationStyle = subCommentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.05)]});;
                response.data.results[i].value[j].animation = subCommentFieldAnimation;
              }
            }
            else
            {
              const subCommentFieldAnimation = new Animated.Value(0);
              response.data.results[i].value.animationStyle = subCommentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.05)]});;
              response.data.results[i].value.animation = subCommentFieldAnimation;
            }

            if(commentsComponent.nestedComments)
            {
              CommentHelper.ApplylResultNested( response.data.results[i],
                                                newCustomDetails[response.data.results[i].field]);
            }
          }

          else
          {
            switch(response.data.results[i].action)
            {
              case '=':
                newCustomDetails[response.data.results[i].field] = response.data.results[i].value;
                break;
              case 'alert':
                this.props.showAlert(response.data.results[i].params.title, response.data.results[i].params.message);
                break;
              case 'append':
                newCustomDetails[response.data.results[i].field].push(response.data.results[i].value);
                break;
              case 'remove':
                newCustomDetails[response.data.results[i].field].splice(response.data.results[i].params.index, 1);
                break;
              case 'replace':
                newCustomDetails[response.data.results[i].field][response.data.results[i].params.index] = response.data.results[i].value;
                break;
              case 'updateState':
                this.setState({ [response.data.results[i].field]: response.data.results[i].value });
                break;
              default:
                break;
            }
          }
        }
        //console.log(newCustomDetails);
        this.setState(
        {
          isLoading: false,
          customDetails: newCustomDetails,
          commentText: (params.action === 'comment' ? '' : this.state.commentText),
          subCommentText: (params.action === 'comment' ? '' : this.state.subCommentText)
        });
      }
      else
      {
        this.setState({ isLoading: false  });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.setState({ isLoading: false  });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 8 ' + err.message, 'danger');
    }
  }


  /**
    Allow child page to update our formInput state
    @param  {String}  id  Id of state to update
    @param  {Any}     value   The value to update to
  */
  updateMasterState = (id, value) =>
  {
    // More detail visible is a global variable because it affects the header
    if(id === 'moreDetailVisible')
    {
      this.props.updateGlobalState(id, value);
    }
    else
    {
      this.setState({ [id]: value });
    }
  }

  // MARK: - Component comments
  /**
    Toggle the keyboard for a comment component
    @param  {Int} newActiveCell The new cell that is active (-1 signifies nothing is)
    @param  {Int} depth   The depth of the cell in a nested container
    @param  {String}  id  The ID of the cell we want the animation of
    @param  {[String]}  reverseOrderParents Array of parent IDs to traverse to find the node in question (nested)
  */
  toggleCommentKeyboard = (newActiveCell, depth, id) =>
  {
    console.log(newActiveCell + " prev " + this.state.activeCellIdx );
    // Clear comment text if changing active cell
    if(newActiveCell !== this.state.activeCell)
    {
      const animations = this._commentHelper.getAnimations(newActiveCell,
                                                          this.state.activeCellIdx,
                                                          depth,
                                                          id,
                                                          this.state.activeCellId,
                                                          this.state.customDetails.comments);
      Animated.parallel(animations);
      this.setState({ activeCellIdx: newActiveCell, activeCellId: newActiveCell === -1 ? '' : id, subCommentText: '' });
    }
  }

  async componentDidMount()
  {
    await this.loadData();
  }

  render()
  {
    console.log('Detail.render()');
    const layout = this._manager.getPage('detail').layout;

    const components = [...this.state.components];
    let commentsComponent = null;
    for(let i = 0; i < components.length; i++)
    {
      if(components[i].type === 'comments')
      {
        commentsComponent = components[i];
        break;
      }
    }

    return (
      <SafeAreaView style={{backgroundColor: Colors.cAccordionRowInactive}}>
      {this.state.detail && layout === 1 &&
        <Layout1
          userId={this.props.user ? this.props.user._id : 'guest'}
          isLoading={this.state.isLoading}
          detail={this.state.detail}
          customDetails={this.state.customDetails}
          updateMasterState={this.updateMasterState}
          commentText={this.state.commentText}
          commentFieldAnimation={this._commentHelper.getCommentFieldAnimationStyle()}
          performAction={this.performAction}
          activeCellIdx={this.state.activeCellIdx}
          activeCellId={this.state.activeCellId}
          subCommentText={this.state.subCommentText}
          nestedComments={commentsComponent.nestedComments}
          commentsEnabled={commentsComponent.isEnabled}
          toggleCommentKeyboard={this.toggleCommentKeyboard}
          moreDetailVisible={this.props.moreDetailVisible}
        />
      }
      </SafeAreaView>
    );
  }
}
