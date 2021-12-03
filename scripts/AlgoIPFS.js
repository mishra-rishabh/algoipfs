const path = require( "path" ) ;
const AlgoPack = require( "./AlgoPack" ) ;
const IPFSPack = require( "./IPFSPack" ) ;

const sleep = ( ms ) => {
  return new Promise( resolve => setTimeout( resolve , ms ) ) ;
}

module.exports = class AlgoIPFS {
  constructor( algodConfig ) {
    this.algodConfig = algodConfig ;
    this.encryptionPassword = algodConfig.encryptionPassword ;
  }

  async init() {
    this.algoPack = new AlgoPack( this.algodConfig ) ;
    this.ipfsPack = new IPFSPack( this.encryptionPassword ) ;

    await this.ipfsPack.init() ;
  }

  async pushFile( filePath ) {
    // upload file to IPFS
    const fileAdded = await this.ipfsPack.uploadFile( filePath ) ;

    // APPEND information to Algorand
    await this.algoPack.appendFileInfo( fileAdded ) ;

    console.log( "File uploaded successfully!" ) ;
  }

  async fetchFile( filePath ) {
    const fileName = path.basename( filePath ) ;

    // GET info from Algorand (try 3 times)
    let retry = 3 ;
    let fileInfo = null ;

    do {
      if( retry !== 3 && !fileInfo ) {
        console.log( `Couldn't find ${ fileName } information, retrying in 5 seconds...` ) ;
        await sleep( 5000 ) ;
      }

      fileInfo = await this.algoPack.searchFileInfo( fileName ) ;
    } while( retry-- > 0 && !fileInfo ) ;

    // RETRIEVE file contents
    await this.ipfsPack.downloadFile( fileInfo ) ;

    console.log( "File successfully fetched!" ) ;
  }
}
