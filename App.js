require( "dotenv" ).config() ;
const AlgoIPFS = require( "./scripts/AlgoIPFS" ) ;
const main = require( "algosdk/dist/types/src/main" ) ;
const ArgumentParser = require( "argparse" ).ArgumentParser ;

const ALGOD_CONFIG = {
  algodToken: {
    "x-api-key": process.env.API_KEY || ""
  } ,

  algodServer: process.env.ALGOD_SERVER || "" ,
  indexerServer: process.env.INDEXER_SERVER || "" ,
  algodPort: process.env.ALGO_PORT || "" ,

  account: {
    addr: process.env.ACCOUNT_ADDRESS ,
    sk: new Uint8Array( process.env.SK.split( "," ) )
  }
}

const parseArgs = () => {
 
  let parser = new ArgumentParser( {
    prog: "PROG" ,
    add_help: true ,
    description: "Algorand-IPFS for secure file sharing"
  } ) ;

  parser.add_argument(
    "-e" , "--example" ,
    {
      action: "store_true" ,
      help: "Test the complete flow -- Upload to Algorand/IPFS the Algorand white paper and download it shortly after" ,
    }
  ) ;

  parser.add_argument(
    "-u" , "--upload" ,
    {
      help: "Encrypt and upload file to IPFS and record hash and filename in Algorand"
    }
  ) ;

  parser.add_argument(
    "-d" , "--download" ,
    {
      help: "Search filehash in Algorand and proceed to download from IPFS then decrypt it"
    }
  ) ;

  return parser ;
}

class App {
  async main () {
    let parser = parseArgs() ;
    let args = parser.parse_args() ;

    if( args.example ) {
      await this.example ;
    }
    else if( args.upload ) {
      await this.run( "upload" , args.upload ) ;
    }
    else if( args.download ) {
      await this.run( "download" , args.download ) ;
    }
    else {
      parser.print_help() ;
    }
  }

  sleep ( ms ) {
    return new Promise( resolve => setTimeout( resolve , ms ) ) ;
  }

  async example () {
    const filePath = "./assets/sorting.pdf" ;
    const algo_ipfs = new AlgoIPFS( {
      ...ALGOD_CONFIG ,
      encryptionPassword: process.env.ENCRYPTION_PASSWORD
    } ) ;

    await algo_ipfs.init() ;
    await algo_ipfs.pushFile( filePath ) ;

    console.log( "Waiting 5 seconds for propagation of indexer" ) ;
    await this.sleep( 5000 ) ;

    await algo_ipfs.fetchFile( filePath ) ;
  }

  async run ( action , filePath ) {
    const algo_ipfs = new AlgoIPFS( {
      ...ALGOD_CONFIG ,
      encryptionPassword: process.env.ENCRYPTION_PASSWORD
    } ) ;

    await algo_ipfs.init() ;

    if( action === "upload" ) {
      await algo_ipfs.pushFile( filePath ) ;
    }
    else if( action === "download" ) {
      await algo_ipfs.fetchFile( filePath ) ;
    }
    else {
      error_msg = `Invalid action: ${ action } ${ filename }` ;
      throw error_msg ;
    }
  }
}

async function globalMain() {
  app = new App() ;
  await app.main() ;
  process.exit() ;
}

globalMain() ;

