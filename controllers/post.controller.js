const router = require('express').Router();
const Post = require('../models/post.model');
const Account = require('../models/account.model');
const Comment = require('../models/comment.model');
const SavedSearch = require('../models/savedsearch.model');

router.post('/get_saved_search', async (req, resp) => {
	let index = req.body.index;
	let count = req.body.count;
	let searchList = await SavedSearch.find({}).skip(index).limit(count).exec();
	console.log(searchList);

	if (searchList.length){
		searchListData = searchList.map(savedSearch => {
			return {
				id: savedSearch._id,
				keyword: savedSearch.keyword,
				created: savedSearch.CreatedTime,
			}
		});

		resp.json({
			code: 1000,
			message: 'OK',
			data: searchList,
		});
	} else {
		resp.json({
			code: 9994,
			message: 'No data or end of list data',
		})
	}
});

router.post('/search', async (req, resp) => {
	let token = req.body.token;
	let keyword = req.body.keyword;
  let user_id = req.body.user_id;
  let index = req.body.index;
  let count = req.body.count;

	new SavedSearch({
		account_id: user_id,
		keyword: keyword,
	}).save();

	// find post
	let posts = await Post.find(
		 { $text: { $search: keyword } },
		 { score: { $meta: "textScore" } }
	).sort( { score: { $meta: "textScore" } } ).skip(0).limit(0).exec();
	console.log(posts);
	let postsData = await Promise.all(posts.map(mapPostData));
	//console.log(postsData);

	if (posts.length){
		resp.json({
			code: 1000,
			message: 'OK',
			data: postsData,
		});
	} else {
		resp.json({
			code: 9994,
			message: 'No data or end of list data',
		})
	}

});

// map data from posts array to return data for client
async function mapPostData(post){
	let likeCount = post.userLike_id.length;
	let commentCount = await Comment.where({post_id: post._id}).countDocuments();
	let is_liked = (post.userLike_id.indexOf(post.account_id) != -1) ? 'true' : 'false';
	let author = await Account.findOne({_id: post.account_id});

	return {
		id: post._id,
		image: post.image,
		video: {
			thumb: '',
			url: '',
		},
		like: likeCount,
		comment: commentCount,
		is_liked: is_liked,
		author: {
			id: author._id,
			username: author.name,
			avatar: author.linkAvatar,
		},
		described: '',
	}
}

async function saveSearch(keyword, accountId){
	await new SavedSearch({

	})
}
module.exports = router;
