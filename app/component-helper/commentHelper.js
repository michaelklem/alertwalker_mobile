import React from 'react'
import { Animated, Dimensions } from 'react-native';

class CommentHelper
{
  static singleton = null;

  #commentFieldAnimation = null;
  #commentFieldAnimationStyle = null;

  componentProps: {};

  static GetInstance(componentProps = null)
  {
    // Initialize and setup animation
    if(CommentHelper.singleton == null)
    {
      CommentHelper.singleton = new CommentHelper();
      CommentHelper.singleton.#commentFieldAnimation = new Animated.Value(1);
      CommentHelper.singleton.#commentFieldAnimationStyle = CommentHelper.singleton.#commentFieldAnimation.interpolate({inputRange:[0,1],outputRange:[0,Math.round(Dimensions.get('window').height * 0.09)]});
      CommentHelper.singleton.componentProps = componentProps;
    }
    return CommentHelper.singleton;
  }

  getCommentFieldAnimationStyle()
  {
    return this.#commentFieldAnimationStyle;
  }

  getCommentFieldAnimation()
  {
    return this.#commentFieldAnimation;
  }

  /**
    This will handle adding/removing/replacing a nested comment onto the parent appropriately
    @param  {JSON}  result  The result form the backend containing index/reverseOrderParents/value to modify with
    @param  {[Comment]} comments  The comments to modify
  */
  static ApplylResultNested(result, comments)
  {
    // Adding comment to top level
    if(result.action === 'append' && result.params.index === null)
    {
      comments.push([result.value._id.toString(), {comment: result.value, children: []}]);
      return;
    }

    let topParent = comments[result.params.index][1];

    // Find immediate parent if nested more than one level down
    let immediateParent = topParent;
    if(result.params.reverseOrderParents)
    {
      for(let j = result.params.reverseOrderParents.length - 1; j > -1; j--)
      {
        for(let k = 0; k < immediateParent.children.length; k++)
        {
          if(immediateParent.children[k].comment._id.toString() === result.params.reverseOrderParents[j])
          {
            immediateParent = immediateParent.children[k];
            break;
          }
        }
      }
    }

    // Find ourselves in children of parent if not top parent
    if(result.params.depth > 0)
    {
      for(let j = 0; j < immediateParent.children.length; j++)
      {
        // Find parent and add to it's children
        if(result.action === 'append')
        {
          if(immediateParent.children[j].comment._id.toString() === result.value.parent)
          {
            immediateParent.children[j].children.push({ comment: result.value, children: [], children: [] });
            break;
          }
        }
        // For remove we need to locate the result ID and remove us from the parent
        else if(result.action === 'remove')
        {
          if(immediateParent.children[j].comment._id.toString() === result.value._id.toString())
          {
            immediateParent.children.splice(j, 1);
            break;
          }
        }
        // For replace we need to locate the result ID and replace the comment
        else if(result.action === 'replace')
        {
          if(immediateParent.children[j].comment._id.toString() === result.value._id.toString())
          {
            immediateParent.children[j].comment = result.value;
            break;
          }
        }
      }
      comments[result.params.index][1] = topParent;
    }
    // Replace top level comment
    else
    {
      switch(result.action)
      {
        case 'append':
          coments.push([result.value._id.toString(), {comment: result.value, children: []}]);
          break;
        case 'remove':
          comments.splice(result.params.index, 1);
          break;
        case 'replace':
          immediateParent.comment = result.value;
          break;
        default:
          break;
      }
    }
  }



  /**
    Toggle the keyboard for a comment component
    @param  {Int} activeCell  New active cell or -1 if nothing is active
    @param  {Int} depth   The depth of the cell in a nested container
    @param  {String}  newId  The ID of the cell we want the animation of
    @param  {String}  currentId  The ID of the current cell that is already activated
    @param  {Int}  currentActiveCell The currently selected cell
    @param  {[Comment]}   comments  Comment records
  */
  getAnimations(newActiveCell,
                currentActiveCell,
                depth,
                newId,
                currentId,
                comments)
  {
    const animations = [];
    // Clear comment text if changing active cell
    if(newActiveCell !== currentActiveCell || newId !==  currentId)
    {
      // Open for new comment
      if(newActiveCell !== -1)
      {
        if(this.componentProps.nestedComments)
        {
          let node = this.findNodeById(comments, newId, newActiveCell);
          if(node !== null)
          {
            animations.push(Animated.spring(node.comment.animation, { toValue: 1 }).start());
          }
        }
        else
        {
          animations.push(Animated.spring(comments[newActiveCell].animation, { toValue: 1 }).start());
        }
      }

      // If old value close it
      if(currentActiveCell !== -1)
      {
        if(this.componentProps.nestedComments)
        {
          let node = this.findNodeById(comments, currentId, currentActiveCell);
          if(node !== null)
          {
            animations.push(Animated.spring(node.comment.animation, { toValue: 0 }).start());
          }
        }
        else
        {
          animations.push(Animated.timing(comments[currentActiveCell].animation, { toValue: 0 }).start());
        }
      }

      // Need to hide main comment field
      if(newActiveCell !== -1 && currentActiveCell)
      {
        animations.push(Animated.timing(this.#commentFieldAnimation, { toValue: 0 }).start());
      }
      // Show main comment field
      else if(newActiveCell === -1)
      {
        animations.push(Animated.timing(this.#commentFieldAnimation, { toValue: 1 }).start());
      }
    }

    return animations;
  }


  /**
    Finds node by ID in the list of comments
    @param  {[Comment]} comments  The dataset to filter through
    @param  {String}  id  The id of the comment we want to find
    @param  {Int} topIndex  The index of the top level comment if known
    @returns  {Comment}  The comment we wanted to find
  */
  findNodeById(comments, id, topIndex)
  {
    if(this.componentProps.nestedComments)
    {
      let found = false;
      let parent = comments[topIndex][1];
      const childrenToProcess = [];
      if(parent.children.length > 0)
      {
        childrenToProcess.push(parent.children);
      }
      if(parent.comment._id.toString() === id)
      {
        return parent;
      }
      while(childrenToProcess.length > 0 && !found)
      {
        // Handle current node
        const children = childrenToProcess[0];
        if(children[0].comment._id.toString() === id)
        {
          return children[0];
        }

        // Now process children of current node
        for(let j = 0; j < children[0].children.length; j++)
        {
          if(children[0].children[j].comment._id.toString() === id)
          {
            return children[0].children[j];
          }
          if(children[0].children[j].children.length > 0)
          {
            childrenToProcess.push(children[0].children[j].children);
          }
        }

        // Pop off the immediate node now
        childrenToProcess.splice(0,1);
      }
      if(!found)
      {
        console.error("Couldn't find comment in nested comments");
        return null;
      }
    }
    else
    {
      return comments[topIndex];
    }
  }
}

export default CommentHelper;
