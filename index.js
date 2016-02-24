const shell = require('shelljs');
const got = require('got');

// Target repo
const repo = {
  name: 'klamry-test',
  user: 'jrencz',
};
const start = 0;
// Keep this below 10 probably to prevent triggering abuse detection mechanism
// https://developer.github.com/v3#abuse-rate-limits
const limit = 5;

const source = 'https://raw.githubusercontent.com/functionite/klamry-voting/master/talks-list.json';


// Templates
const title = talk => `${ talk.title }`;
const message = talk =>`<table>${ speakerRow(talk) }${ yearRow(talk) }${ videoRow(talk) }</table>`;
const speakerRow = talk =>
  `<tr><td>by</td><td>${ photo(talk.photo) }<br>${ talk.speaker } ${ contact(talk) }</td></tr>`;
const yearRow = talk =>
  `<tr><td>year</td><td><a href="http://summit.meetjs.pl/${ talk.year }/">${ talk.year }</a></td></tr>`;
// Video may be absent
const videoRow = talk => talk.video ?
  `<tr><td>video</td><td><a href="${ talk.video }">Watch</a></td></tr>` :
  '';

const photo = url => `<img src="${ url }">`;

const contact = talk => `${ talk.twitterHandle ? twitter(talk.twitterHandle) : ''} ${ talk.site ? site(talk.site) : '' }`;
// Twitter handle may be absent
const twitter = handle => handle ?
  `<a href="https://twitter.com/${ handle }"><img src="https://g.twimg.com/dev/documentation/image/Twitter_logo_blue_16.png"></a>` :
  '';
const site = url => `<a href="${ url }">site</a>`;

const labels = talk => [
  `speaker:${ talk.speaker }`,
  `year:${ talk.year }`,
]
  .map(label => `'${ label }'`)
  .join();

const escape = string => string.replace(/'/g, "'\\''");
const command = talk => `./node_modules/.bin/gh is --new --title '${ escape(title(talk)) }' --message '${ escape(message(talk)) }' --label ${ labels(talk) } --repo ${ repo.name } --user ${ repo.user }`;

got(source)
  .then(response => JSON.parse(response.body))
  .then(data => {
    console.log(`There are ${ data.length } issues in seed`);
    if (start > 0) {
      console.log(`With current params it is assumed ${ start } issues were already created`);
    }
    console.log(`Will create ${ Math.min((data.length - start), limit) } issues. Starting from ${ start }`);
    if ((start+limit) < data.length) {
      console.log('to finish you should run this script again');
      console.log(`next params: start: ${ start+limit }, limit: ${ limit }`);
    } else {
      console.log('You don\'t have to run this script again. This is the' +
        ' last batch.')
    }
    data.forEach((talk, i) => {
      // Uncomment this line and comment out the loop below to get raw
      // output which you can then use to call one-by one
      // console.log(command(talk))

      // No time for handling rate limits now
      if (i >= start && i < (start+limit)) {
        console.log(i, 'will create', talk.title);
        shell.exec(command(talk), {async: true});
      }
    });
  });
