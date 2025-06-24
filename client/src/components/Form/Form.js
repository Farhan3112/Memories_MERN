import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Typography, Paper, Chip, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';
import { useHistory } from 'react-router-dom';

import { createPost, updatePost } from '../../actions/posts';
import useStyles from './styles';

const chipStyles = makeStyles((theme) => ({
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

const Form = ({ currentId, setCurrentId }) => {
  const [postData, setPostData] = useState({ title: '', message: '', tags: [], selectedFile: '' });
  const [tagInput, setTagInput] = useState('');
  const post = useSelector((state) => (currentId ? state.posts.posts.find((message) => message._id === currentId) : null));
  const dispatch = useDispatch();
  const classes = useStyles();
  const chipClasses = chipStyles();
  const user = JSON.parse(localStorage.getItem('profile'));
  const history = useHistory();

  const [fileInputKey,setFileInputKey]=useState(Math.random());

  const clear = useCallback(() => {
    setCurrentId(0);
    setPostData({ title: '', message: '', tags: [], selectedFile: '' });
    setTagInput('');
    setFileInputKey(Math.random());
  }, [setCurrentId]);

  useEffect(() => {
    if (!post?.title) clear();
    if (post) setPostData(post);
  }, [post, clear]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentId === 0) {
      dispatch(createPost({ ...postData, name: user?.result?.name }, history));
      clear();
    } else {
      dispatch(updatePost(currentId, { ...postData, name: user?.result?.name }));
      clear();
    }
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!postData.tags.includes(newTag)) {
        setPostData({ ...postData, tags: [...postData.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setPostData({ ...postData, tags: postData.tags.filter((tag) => tag !== tagToDelete) });
  };

  if (!user?.result?.name) {
    return (
      <Paper className={classes.paper} elevation={6}>
        <Typography variant="h6" align="center">
          Please Sign In to create your own memories and like other's memories.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper} elevation={6}>
      <form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={handleSubmit}>
        <Typography variant="h6">{currentId ? `Editing "${post?.title}"` : 'Creating a Memory'}</Typography>
        <TextField
          name="title"
          variant="outlined"
          label="Title"
          fullWidth
          value={postData.title}
          onChange={(e) => setPostData({ ...postData, title: e.target.value })}
        />
        <TextField
          name="message"
          variant="outlined"
          label="Message"
          fullWidth
          multiline
          rows={4}
          value={postData.message}
          onChange={(e) => setPostData({ ...postData, message: e.target.value })}
        />

        {/* Tag Input */}
        <TextField
          name="tagInput"
          variant="outlined"
          label="Add Tag"
          fullWidth
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
        <div className={chipClasses.chipContainer}>
          {postData.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => handleDeleteTag(tag)}
              className={chipClasses.chip}
              color="primary"
            />
          ))}
        </div>

        <div className={classes.fileInput}><FileBase type="file" key={fileInputKey} multiple={false} onDone={({ base64 }) => setPostData({ ...postData, selectedFile: base64 })} /></div>
        <Button className={classes.buttonSubmit} variant="contained" color="primary" size="large" type="submit" fullWidth>
          Submit
        </Button>
        <Button variant="contained" color="secondary" size="small" onClick={clear} fullWidth>
          Clear
        </Button>
      </form>
    </Paper>
  );
};

export default Form;
